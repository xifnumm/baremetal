import {
	Withdrawals,
	StorageType,
	Account,
	Deposits,
} from '../app/generated/prisma/client';

// Base withdrawal type from Prisma
export type WithdrawalType = Withdrawals;

// Withdrawal with relations
export type WithdrawalWithRelations = Withdrawals & {
	account: Account;
	deposit: Deposits | null;
};

// Create withdrawal input
export type CreateWithdrawalInput = {
	accountId: string;
	withdrawalNumber: string;
	metalType: string;
	storageType: StorageType;
	quantity: number;
	barSerial?: string; // Optional: for specifying specific bar in allocated storage
};

// Withdrawal summary for tables
export type WithdrawalSummary = {
	id: string;
	withdrawalNumber: string;
	accountName: string;
	accountId: string;
	metalType: string;
	storageType: StorageType;
	quantity: number;
	barSerial?: string | null;
	withdrawnAt: Date;
	depositNumber?: string | null;
};

// Inventory summary
export type InventorySummary = {
	inventoryByMetal: Array<{
		metalType: string;
		allocated: {
			quantity: number;
			bars: number;
			accountCount: number;
		};
		unallocated: {
			quantity: number;
			deposits: number;
			accountCount: number;
		};
		totalQuantity: number;
	}>;
	totalDeposits: number;
	totalAccounts: number;
};

// Account inventory
export type AccountInventory = {
	accountId: string;
	accountName: string;
	accountEmail: string;
	accountType: string;
	holdings: {
		[metalType: string]: {
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
		};
	};
	totalDeposits: number;
};

// Inventory by metal type
export type InventoryByMetal = {
	metalType: string;
	totalQuantity: number;
	allocated: {
		quantity: number;
		bars: number;
		deposits: Array<{
			id: string;
			depositNumber: string;
			barSerial: string | null;
			quantity: number;
			accountName: string;
			accountType: string;
			depositedAt: Date;
		}>;
	};
	unallocated: {
		quantity: number;
		deposits: number;
		details: Array<{
			id: string;
			depositNumber: string;
			quantity: number;
			accountName: string;
			accountType: string;
			depositedAt: Date;
		}>;
	};
};

// Allocated bar tracking
export type AllocatedBar = {
	depositId: string;
	depositNumber: string;
	barSerial: string | null;
	metalType: string;
	quantity: number;
	originalQuantity: number;
	accountId: string;
	accountName: string;
	accountType: string;
	depositedAt: Date;
};

// Unallocated pool summary
export type UnallocatedPoolSummary = {
	metalType: string;
	totalQuantity: number;
	depositCount: number;
	accountCount: number;
};

// Audit trail entry
export type AuditTrailEntry = {
	type: 'DEPOSIT' | 'WITHDRAWAL';
	id: string;
	number: string;
	accountName: string;
	metalType: string;
	storageType: string;
	quantity: number;
	barSerial?: string | null;
	date: Date;
	remainingQuantity?: number; // Only for deposits
};

// Audit trail
export type AuditTrail = {
	deposits: Array<AuditTrailEntry>;
	withdrawals: Array<AuditTrailEntry>;
};

// Storage statistics (for dashboard)
export type StorageStatistics = {
	totalAllocatedBars: number;
	totalUnallocatedDeposits: number;
	totalQuantityByMetal: {
		[metalType: string]: {
			allocated: number;
			unallocated: number;
			total: number;
		};
	};
};

// Withdrawal form data (for UI)
export type WithdrawalFormData = {
	accountId: string;
	withdrawalNumber: string;
	metalType: 'Gold' | 'Silver' | 'Platinum';
	storageType: StorageType;
	quantity: number;
	barSerial?: string;
};

// Export StorageType enum for convenience
export { StorageType };
