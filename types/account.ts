import {
	Account,
	Deposits,
	Withdrawals,
	ClientType,
} from '../app/generated/prisma/client';

// Base account type from Prisma
export type AccountType = Account;

// Account with relations
export type AccountWithRelations = Account & {
	deposits: Deposits[];
	withdrawals: Withdrawals[];
};

// Account with only active deposits (remainingQuantity > 0)
export type AccountWithActiveDeposits = Account & {
	deposits: Deposits[];
};

// Create account input
export type CreateAccountInput = {
	email: string;
	name: string;
	type: ClientType;
};

// Update account input
export type UpdateAccountInput = {
	email?: string;
	name?: string;
};

// Account summary for display
export type AccountSummary = {
	id: string;
	email: string;
	name: string;
	type: ClientType;
	createdAt: Date;
	totalDeposits: number;
	totalWithdrawals: number;
	activeDepositsCount: number;
};

// Account portfolio view
export type AccountPortfolio = {
	account: Account;
	holdings: {
		metalType: string;
		totalQuantity: number;
		totalValue: number;
		deposits: Array<{
			id: string;
			depositNumber: string;
			quantity: number;
			remainingQuantity: number;
			storageType: string;
			barSerial?: string | null;
			depositedAt: Date;
		}>;
	}[];
	totalPortfolioValue: number;
};

// Export ClientType enum for convenience
export { ClientType };
