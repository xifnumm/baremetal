// Supported metal types
export type MetalType = 'Gold' | 'Silver' | 'Platinum';

// Metal price per kg (USD)
export type MetalPrice = {
	metalType: MetalType;
	pricePerKg: number;
	lastUpdated?: Date;
};

// All metal prices
export type MetalPrices = {
	Gold: number;
	Silver: number;
	Platinum: number;
};

// Single holding valuation
export type HoldingValuation = {
	depositId: string;
	depositNumber: string;
	metalType: string;
	storageType: string;
	quantity: number;
	pricePerKg: number;
	value: number;
	barSerial?: string | null;
};

// Account valuation
export type AccountValuation = {
	accountId: string;
	accountName: string;
	accountType: string;
	totalValue: number;
	breakdown: HoldingValuation[];
	summary: {
		[metalType: string]: {
			quantity: number;
			value: number;
			deposits: number;
		};
	};
	prices: MetalPrices;
};

// Metal summary across all accounts
export type MetalSummary = {
	metalType: string;
	totalQuantity: number;
	pricePerKg: number;
	totalValue: number;
	depositCount: number;
	accountCount: number;
};

// Overall platform valuation
export type PlatformValuation = {
	grandTotal: number;
	accountCount: number;
	valuations: AccountValuation[];
	prices: MetalPrices;
};

// Metal type valuation
export type MetalTypeValuation = {
	metals: MetalSummary[];
	grandTotal: number;
	prices: MetalPrices;
};

// Portfolio comparison (for charts)
export type PortfolioComparison = {
	accounts: Array<{
		accountId: string;
		accountName: string;
		totalValue: number;
		metalBreakdown: Array<{
			metalType: string;
			value: number;
			percentage: number;
		}>;
	}>;
};

// Metal distribution (for pie charts)
export type MetalDistribution = {
	metalType: MetalType;
	quantity: number;
	value: number;
	percentage: number; // Percentage of total portfolio
};
