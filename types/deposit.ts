import {
	Account,
	Deposits,
	StorageType,
	Withdrawals,
} from '../app/generated/prisma/client';

// Base deposit type from Prisma
export type DepositType = Deposits;

// Deposit with account relation
export type DepositWithAccount = Deposits & {
	account: Account;
};

// Deposit with all relations
export type DepositWithRelations = Deposits & {
	account: Account;
	withdrawals: Withdrawals[];
};

// Create deposit input
export type CreateDepositInput = {
	accountId: string;
	depositNumber: string;
	metalType: string;
	storageType: StorageType;
	quantity: number;
	barSerial?: string; // Required for ALLOCATED, optional for UNALLOCATED
};

// Deposit with remaining percentage
export type DepositWithStatus = Deposits & {
	remainingPercentage: number; // (remainingQuantity / quantity) * 100
	isFullyWithdrawn: boolean;
	account?: Account;
};

// Deposit summary for tables
export type DepositSummary = {
	id: string;
	depositNumber: string;
	accountName: string;
	accountId: string;
	metalType: string;
	storageType: StorageType;
	quantity: number;
	remainingQuantity: number;
	barSerial?: string | null;
	depositedAt: Date;
	status: 'active' | 'partial' | 'withdrawn';
};

// Grouped deposits by metal type
export type DepositsByMetal = {
	metalType: string;
	totalDeposits: number;
	totalQuantity: number;
	totalRemainingQuantity: number;
	deposits: Deposits[];
};

// Deposit form data (for UI)
export type DepositFormData = {
	accountId: string;
	depositNumber: string;
	metalType: 'Gold' | 'Silver' | 'Platinum';
	storageType: StorageType;
	quantity: number;
	barSerial?: string;
};

// Export StorageType enum for convenience
export { StorageType };
