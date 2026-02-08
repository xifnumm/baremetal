import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, StorageType } from '../app/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export class InventoryService {
	async getInventorySummary() {
		const deposits = await prisma.deposits.findMany({
			where: {
				remainingQuantity: {
					gt: 0,
				},
			},
			include: {
				account: true,
			},
		});

		// Group by metal type and storage type
		const summary: Record<
			string,
			{
				allocated: { quantity: number; bars: number; accounts: Set<string> };
				unallocated: {
					quantity: number;
					deposits: number;
					accounts: Set<string>;
				};
				total: number;
			}
		> = {};

		deposits.forEach((deposit) => {
			if (!summary[deposit.metalType]) {
				summary[deposit.metalType] = {
					allocated: { quantity: 0, bars: 0, accounts: new Set() },
					unallocated: { quantity: 0, deposits: 0, accounts: new Set() },
					total: 0,
				};
			}

			if (deposit.storageType === StorageType.ALLOCATED) {
				summary[deposit.metalType].allocated.quantity +=
					deposit.remainingQuantity;
				summary[deposit.metalType].allocated.bars += 1;
				summary[deposit.metalType].allocated.accounts.add(deposit.accountId);
			} else {
				summary[deposit.metalType].unallocated.quantity +=
					deposit.remainingQuantity;
				summary[deposit.metalType].unallocated.deposits += 1;
				summary[deposit.metalType].unallocated.accounts.add(deposit.accountId);
			}

			summary[deposit.metalType].total += deposit.remainingQuantity;
		});

		// Convert to array format
		const inventoryByMetal = Object.entries(summary).map(
			([metalType, data]) => ({
				metalType,
				allocated: {
					quantity: data.allocated.quantity,
					bars: data.allocated.bars,
					accountCount: data.allocated.accounts.size,
				},
				unallocated: {
					quantity: data.unallocated.quantity,
					deposits: data.unallocated.deposits,
					accountCount: data.unallocated.accounts.size,
				},
				totalQuantity: data.total,
			}),
		);

		return {
			inventoryByMetal,
			totalDeposits: deposits.length,
			totalAccounts: new Set(deposits.map((d) => d.accountId)).size,
		};
	}

	async getAccountInventory(accountId: string) {
		const account = await prisma.account.findUnique({
			where: { id: accountId },
			include: {
				deposits: {
					where: {
						remainingQuantity: {
							gt: 0,
						},
					},
					orderBy: { depositedAt: 'desc' },
				},
			},
		});

		if (!account) {
			throw new Error('Account not found');
		}

		// Group by metal type
		const holdings: Record<
			string,
			{
				totalQuantity: number;
				deposits: Array<{
					id: string;
					depositNumber: string;
					quantity: number;
					storageType: StorageType;
					barSerial?: string | null;
					depositedAt: Date;
				}>;
				storageBreakdown: {
					allocated: number;
					unallocated: number;
				};
			}
		> = {};

		account.deposits.forEach((deposit) => {
			if (!holdings[deposit.metalType]) {
				holdings[deposit.metalType] = {
					totalQuantity: 0,
					deposits: [],
					storageBreakdown: {
						allocated: 0,
						unallocated: 0,
					},
				};
			}

			holdings[deposit.metalType].totalQuantity += deposit.remainingQuantity;
			holdings[deposit.metalType].deposits.push({
				id: deposit.id,
				depositNumber: deposit.depositNumber,
				quantity: deposit.remainingQuantity,
				storageType: deposit.storageType,
				barSerial: deposit.barSerial,
				depositedAt: deposit.depositedAt,
			});

			if (deposit.storageType === StorageType.ALLOCATED) {
				holdings[deposit.metalType].storageBreakdown.allocated +=
					deposit.remainingQuantity;
			} else {
				holdings[deposit.metalType].storageBreakdown.unallocated +=
					deposit.remainingQuantity;
			}
		});

		return {
			accountId: account.id,
			accountName: account.name,
			accountEmail: account.email,
			accountType: account.type,
			holdings,
			totalDeposits: account.deposits.length,
		};
	}

	async getInventoryByMetal(metalType: string) {
		const deposits = await prisma.deposits.findMany({
			where: {
				metalType,
				remainingQuantity: {
					gt: 0,
				},
			},
			include: {
				account: true,
			},
			orderBy: { depositedAt: 'asc' },
		});

		const allocated = deposits.filter(
			(d) => d.storageType === StorageType.ALLOCATED,
		);
		const unallocated = deposits.filter(
			(d) => d.storageType === StorageType.UNALLOCATED,
		);

		return {
			metalType,
			totalQuantity: deposits.reduce((sum, d) => sum + d.remainingQuantity, 0),
			allocated: {
				quantity: allocated.reduce((sum, d) => sum + d.remainingQuantity, 0),
				bars: allocated.length,
				deposits: allocated.map((d) => ({
					id: d.id,
					depositNumber: d.depositNumber,
					barSerial: d.barSerial,
					quantity: d.remainingQuantity,
					accountName: d.account.name,
					accountType: d.account.type,
					depositedAt: d.depositedAt,
				})),
			},
			unallocated: {
				quantity: unallocated.reduce((sum, d) => sum + d.remainingQuantity, 0),
				deposits: unallocated.length,
				details: unallocated.map((d) => ({
					id: d.id,
					depositNumber: d.depositNumber,
					quantity: d.remainingQuantity,
					accountName: d.account.name,
					accountType: d.account.type,
					depositedAt: d.depositedAt,
				})),
			},
		};
	}

	async getAvailableInventory() {
		return await this.getInventorySummary();
	}

	async getAllocatedBars(metalType?: string) {
		const deposits = await prisma.deposits.findMany({
			where: {
				storageType: StorageType.ALLOCATED,
				remainingQuantity: {
					gt: 0,
				},
				...(metalType && { metalType }),
			},
			include: {
				account: true,
			},
			orderBy: { depositedAt: 'desc' },
		});

		return deposits.map((d) => ({
			depositId: d.id,
			depositNumber: d.depositNumber,
			barSerial: d.barSerial,
			metalType: d.metalType,
			quantity: d.remainingQuantity,
			originalQuantity: d.quantity,
			accountId: d.account.id,
			accountName: d.account.name,
			accountType: d.account.type,
			depositedAt: d.depositedAt,
		}));
	}

	async getUnallocatedPool(metalType?: string) {
		const deposits = await prisma.deposits.findMany({
			where: {
				storageType: StorageType.UNALLOCATED,
				remainingQuantity: {
					gt: 0,
				},
				...(metalType && { metalType }),
			},
			include: {
				account: true,
			},
		});

		// Group by metal type
		const poolSummary: Record<
			string,
			{
				totalQuantity: number;
				depositCount: number;
				accountCount: number;
				accounts: Set<string>;
			}
		> = {};

		deposits.forEach((d) => {
			if (!poolSummary[d.metalType]) {
				poolSummary[d.metalType] = {
					totalQuantity: 0,
					depositCount: 0,
					accountCount: 0,
					accounts: new Set(),
				};
			}

			poolSummary[d.metalType].totalQuantity += d.remainingQuantity;
			poolSummary[d.metalType].depositCount += 1;
			poolSummary[d.metalType].accounts.add(d.accountId);
		});

		return Object.entries(poolSummary).map(([metal, data]) => ({
			metalType: metal,
			totalQuantity: data.totalQuantity,
			depositCount: data.depositCount,
			accountCount: data.accounts.size,
		}));
	}

	async getAuditTrail(filters?: {
		accountId?: string;
		metalType?: string;
		startDate?: Date;
		endDate?: Date;
	}) {
		const deposits = await prisma.deposits.findMany({
			where: {
				...(filters?.accountId && { accountId: filters.accountId }),
				...(filters?.metalType && { metalType: filters.metalType }),
				...(filters?.startDate && { depositedAt: { gte: filters.startDate } }),
				...(filters?.endDate && { depositedAt: { lte: filters.endDate } }),
			},
			include: {
				account: true,
				withdrawals: true,
			},
			orderBy: { depositedAt: 'desc' },
		});

		const withdrawals = await prisma.withdrawals.findMany({
			where: {
				...(filters?.accountId && { accountId: filters.accountId }),
				...(filters?.metalType && { metalType: filters.metalType }),
				...(filters?.startDate && { withdrawnAt: { gte: filters.startDate } }),
				...(filters?.endDate && { withdrawnAt: { lte: filters.endDate } }),
			},
			include: {
				account: true,
				deposit: true,
			},
			orderBy: { withdrawnAt: 'desc' },
		});

		return {
			deposits: deposits.map((d) => ({
				type: 'DEPOSIT',
				id: d.id,
				number: d.depositNumber,
				accountName: d.account.name,
				metalType: d.metalType,
				storageType: d.storageType,
				quantity: d.quantity,
				remainingQuantity: d.remainingQuantity,
				barSerial: d.barSerial,
				date: d.depositedAt,
			})),
			withdrawals: withdrawals.map((w) => ({
				type: 'WITHDRAWAL',
				id: w.id,
				number: w.withdrawalNumber,
				accountName: w.account.name,
				metalType: w.metalType,
				storageType: w.storageType,
				quantity: w.quantity,
				barSerial: w.barSerial,
				date: w.withdrawnAt,
			})),
		};
	}
}
