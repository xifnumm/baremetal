import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
	ClientType,
	PrismaClient,
	StorageType,
} from '../app/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export class DepositService {
	async createDeposit(data: {
		accountId: string;
		depositNumber: string;
		metalType: string;
		storageType: StorageType;
		quantity: number;
		barSerial?: string; // Required for ALLOCATED storage
	}) {
		const account = await prisma.account.findUnique({
			where: { id: data.accountId },
		});

		if (!account) {
			throw new Error('Account not found');
		}

		if (
			account.type === ClientType.RETAIL &&
			data.storageType === StorageType.ALLOCATED
		) {
			throw new Error('RETAIL clients can only use UNALLOCATED storage');
		}

		if (
			account.type === ClientType.INSTITUTIONAL &&
			data.storageType === StorageType.UNALLOCATED
		) {
			throw new Error('INSTITUTIONAL clients can only use ALLOCATED storage');
		}

		// Validate barSerial for ALLOCATED storage
		if (data.storageType === StorageType.ALLOCATED && !data.barSerial) {
			throw new Error('Bar serial number is required for ALLOCATED storage');
		}

		// Check if barSerial already exists (for ALLOCATED)
		if (data.barSerial) {
			const existingDeposit = await prisma.deposits.findFirst({
				where: {
					barSerial: data.barSerial,
					remainingQuantity: {
						gt: 0,
					},
				},
			});

			if (existingDeposit) {
				throw new Error('Bar serial number already exists in custody');
			}
		}

		// Check if deposit number already exists
		const existingDepositNumber = await prisma.deposits.findUnique({
			where: { depositNumber: data.depositNumber },
		});

		if (existingDepositNumber) {
			throw new Error('Deposit number already exists');
		}

		// Create deposit
		const deposit = await prisma.deposits.create({
			data: {
				accountId: data.accountId,
				depositNumber: data.depositNumber,
				metalType: data.metalType,
				storageType: data.storageType,
				quantity: data.quantity,
				remainingQuantity: data.quantity,
				barSerial: data.barSerial,
			},
			include: {
				account: true,
			},
		});

		return deposit;
	}

	async getDepositById(depositId: string) {
		const deposit = await prisma.deposits.findUnique({
			where: { id: depositId },
			include: {
				account: true,
				withdrawals: true,
			},
		});

		if (!deposit) {
			throw new Error('Deposit not found');
		}

		return deposit;
	}

	async getDepositsByAccount(accountId: string) {
		const deposits = await prisma.deposits.findMany({
			where: { accountId },
			orderBy: { depositedAt: 'desc' },
			include: {
				account: true,
			},
		});

		return deposits;
	}

	async getActiveDeposits() {
		const deposits = await prisma.deposits.findMany({
			where: {
				remainingQuantity: {
					gt: 0,
				},
			},
			orderBy: { depositedAt: 'desc' },
			include: {
				account: true,
			},
		});

		return deposits;
	}

	async getDepositsByFilter(filters: {
		metalType?: string;
		storageType?: StorageType;
		accountId?: string;
	}) {
		const deposits = await prisma.deposits.findMany({
			where: {
				metalType: filters.metalType,
				storageType: filters.storageType,
				accountId: filters.accountId,
				remainingQuantity: {
					gt: 0,
				},
			},
			orderBy: { depositedAt: 'asc' },
			include: {
				account: true,
			},
		});

		return deposits;
	}
}
