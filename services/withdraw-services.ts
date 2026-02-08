import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, StorageType } from '../app/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export class WithdrawalService {
	async createWithdrawal(data: {
		accountId: string;
		withdrawalNumber: string;
		metalType: string;
		storageType: StorageType;
		quantity: number;
		barSerial?: string; // Optional: specify which bar for ALLOCATED
	}) {
		// Validate account exists
		const account = await prisma.account.findUnique({
			where: { id: data.accountId },
		});

		if (!account) {
			throw new Error('Account not found');
		}

		// Check if withdrawal number already exists
		const existingWithdrawal = await prisma.withdrawals.findUnique({
			where: { withdrawalNumber: data.withdrawalNumber },
		});

		if (existingWithdrawal) {
			throw new Error('Withdrawal number already exists');
		}

		// Validate quantity
		if (data.quantity <= 0) {
			throw new Error('Withdrawal quantity must be greater than 0');
		}

		// Handle withdrawal based on storage type
		if (data.storageType === StorageType.ALLOCATED) {
			return await this.handleAllocatedWithdrawal(data);
		} else {
			return await this.handleUnallocatedWithdrawal(data);
		}
	}

	private async handleAllocatedWithdrawal(data: {
		accountId: string;
		withdrawalNumber: string;
		metalType: string;
		storageType: StorageType;
		quantity: number;
		barSerial?: string;
	}) {
		// Find available deposits for this account with the specified metal type
		const availableDeposits = await prisma.deposits.findMany({
			where: {
				accountId: data.accountId,
				metalType: data.metalType,
				storageType: StorageType.ALLOCATED,
				remainingQuantity: {
					gt: 0,
				},
			},
			orderBy: { depositedAt: 'asc' },
		});

		if (availableDeposits.length === 0) {
			throw new Error(`No ${data.metalType} deposits found for this account`);
		}

		// If barSerial is specified, find that specific deposit
		// eslint-disable-next-line prefer-const
		let depositToWithdrawFrom = data.barSerial
			? availableDeposits.find((d) => d.barSerial === data.barSerial)
			: availableDeposits[0]; // Otherwise, take the oldest deposit

		if (!depositToWithdrawFrom) {
			throw new Error(
				data.barSerial
					? `Bar serial ${data.barSerial} not found or already withdrawn`
					: 'No available deposits to withdraw from',
			);
		}

		// Check if requested quantity is available
		if (data.quantity > depositToWithdrawFrom.remainingQuantity) {
			throw new Error(
				`Insufficient quantity. Available: ${depositToWithdrawFrom.remainingQuantity}kg, Requested: ${data.quantity}kg`,
			);
		}

		// Process withdrawal in a transaction
		const result = await prisma.$transaction(async (tx) => {
			// Update deposit remaining quantity
			const updatedDeposit = await tx.deposits.update({
				where: { id: depositToWithdrawFrom!.id },
				data: {
					remainingQuantity: {
						decrement: data.quantity,
					},
				},
			});

			// Create withdrawal record
			const withdrawal = await tx.withdrawals.create({
				data: {
					accountId: data.accountId,
					depositId: depositToWithdrawFrom!.id,
					withdrawalNumber: data.withdrawalNumber,
					metalType: data.metalType,
					storageType: data.storageType,
					quantity: data.quantity,
					barSerial: depositToWithdrawFrom!.barSerial,
				},
				include: {
					account: true,
					deposit: true,
				},
			});

			return { withdrawal, updatedDeposit };
		});

		return result.withdrawal;
	}

	private async handleUnallocatedWithdrawal(data: {
		accountId: string;
		withdrawalNumber: string;
		metalType: string;
		storageType: StorageType;
		quantity: number;
	}) {
		// Find available deposits for this account with the specified metal type
		const availableDeposits = await prisma.deposits.findMany({
			where: {
				accountId: data.accountId,
				metalType: data.metalType,
				storageType: StorageType.UNALLOCATED,
				remainingQuantity: {
					gt: 0,
				},
			},
			orderBy: { depositedAt: 'asc' }, // FIFO - oldest first
		});

		if (availableDeposits.length === 0) {
			throw new Error(`No ${data.metalType} deposits found for this account`);
		}

		// Calculate total available quantity
		const totalAvailable = availableDeposits.reduce(
			(sum, deposit) => sum + deposit.remainingQuantity,
			0,
		);

		if (data.quantity > totalAvailable) {
			throw new Error(
				`Insufficient quantity. Available: ${totalAvailable}kg, Requested: ${data.quantity}kg`,
			);
		}

		// Process withdrawal in a transaction
		const result = await prisma.$transaction(async (tx) => {
			let remainingToWithdraw = data.quantity;
			const withdrawals = [];

			// Deduct from deposits using FIFO
			for (const deposit of availableDeposits) {
				if (remainingToWithdraw <= 0) break;

				const amountToDeduct = Math.min(
					remainingToWithdraw,
					deposit.remainingQuantity,
				);

				// Update deposit
				await tx.deposits.update({
					where: { id: deposit.id },
					data: {
						remainingQuantity: {
							decrement: amountToDeduct,
						},
					},
				});

				// Create withdrawal record for this portion
				const withdrawal = await tx.withdrawals.create({
					data: {
						accountId: data.accountId,
						depositId: deposit.id,
						withdrawalNumber: `${data.withdrawalNumber}-${withdrawals.length + 1}`,
						metalType: data.metalType,
						storageType: data.storageType,
						quantity: amountToDeduct,
					},
				});

				withdrawals.push(withdrawal);
				remainingToWithdraw -= amountToDeduct;
			}

			// Return the main withdrawal record (first one)
			return await tx.withdrawals.findUnique({
				where: { id: withdrawals[0].id },
				include: {
					account: true,
					deposit: true,
				},
			});
		});

		return result;
	}

	async getWithdrawalById(withdrawalId: string) {
		const withdrawal = await prisma.withdrawals.findUnique({
			where: { id: withdrawalId },
			include: {
				account: true,
				deposit: true,
			},
		});

		if (!withdrawal) {
			throw new Error('Withdrawal not found');
		}

		return withdrawal;
	}

	async getWithdrawalsByAccount(accountId: string) {
		const withdrawals = await prisma.withdrawals.findMany({
			where: { accountId },
			orderBy: { withdrawnAt: 'desc' },
			include: {
				account: true,
				deposit: true,
			},
		});

		return withdrawals;
	}

	async getAllWithdrawals() {
		const withdrawals = await prisma.withdrawals.findMany({
			orderBy: { withdrawnAt: 'desc' },
			include: {
				account: true,
				deposit: true,
			},
		});

		return withdrawals;
	}
}
