import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Hardcoded metal prices per kg (USD)
const METAL_PRICES: Record<string, number> = {
	Gold: 60000,
	Silver: 800,
	Platinum: 35000,
};

export class ValuationService {
	getMetalPrice(metalType: string): number {
		const price = METAL_PRICES[metalType];
		if (!price) {
			throw new Error(`Price not available for metal type: ${metalType}`);
		}
		return price;
	}

	getAllPrices() {
		return METAL_PRICES;
	}

	calculateValue(metalType: string, quantity: number): number {
		const pricePerKg = this.getMetalPrice(metalType);
		return pricePerKg * quantity;
	}

	async getAccountValuation(accountId: string) {
		// Get all active deposits for this account
		const deposits = await prisma.deposits.findMany({
			where: {
				accountId,
				remainingQuantity: {
					gt: 0,
				},
			},
			include: {
				account: true,
			},
		});

		if (deposits.length === 0) {
			return {
				accountId,
				totalValue: 0,
				breakdown: [],
				summary: {},
			};
		}

		// Group by metal type and calculate values
		const metalSummary: Record<
			string,
			{ quantity: number; value: number; deposits: number }
		> = {};

		let totalValue = 0;

		const breakdown = deposits.map((deposit) => {
			const pricePerKg = this.getMetalPrice(deposit.metalType);
			const value = deposit.remainingQuantity * pricePerKg;
			totalValue += value;

			// Update summary
			if (!metalSummary[deposit.metalType]) {
				metalSummary[deposit.metalType] = {
					quantity: 0,
					value: 0,
					deposits: 0,
				};
			}
			metalSummary[deposit.metalType].quantity += deposit.remainingQuantity;
			metalSummary[deposit.metalType].value += value;
			metalSummary[deposit.metalType].deposits += 1;

			return {
				depositId: deposit.id,
				depositNumber: deposit.depositNumber,
				metalType: deposit.metalType,
				storageType: deposit.storageType,
				quantity: deposit.remainingQuantity,
				pricePerKg,
				value,
				barSerial: deposit.barSerial,
			};
		});

		return {
			accountId,
			accountName: deposits[0].account.name,
			accountType: deposits[0].account.type,
			totalValue,
			breakdown,
			summary: metalSummary,
			prices: METAL_PRICES,
		};
	}

	async getAllAccountsValuation() {
		const accounts = await prisma.account.findMany({
			include: {
				deposits: {
					where: {
						remainingQuantity: {
							gt: 0,
						},
					},
				},
			},
		});

		const valuations = await Promise.all(
			accounts.map(async (account) => {
				return await this.getAccountValuation(account.id);
			}),
		);

		// Calculate total across all accounts
		const grandTotal = valuations.reduce((sum, val) => sum + val.totalValue, 0);

		return {
			grandTotal,
			accountCount: accounts.length,
			valuations,
			prices: METAL_PRICES,
		};
	}

	async getMetalTypeValuation() {
		const deposits = await prisma.deposits.findMany({
			where: {
				remainingQuantity: {
					gt: 0,
				},
			},
		});

		const metalSummary: Record<
			string,
			{
				totalQuantity: number;
				totalValue: number;
				depositCount: number;
				accountCount: number;
				accounts: Set<string>;
			}
		> = {};

		deposits.forEach((deposit) => {
			if (!metalSummary[deposit.metalType]) {
				metalSummary[deposit.metalType] = {
					totalQuantity: 0,
					totalValue: 0,
					depositCount: 0,
					accountCount: 0,
					accounts: new Set(),
				};
			}

			const pricePerKg = this.getMetalPrice(deposit.metalType);
			const value = deposit.remainingQuantity * pricePerKg;

			metalSummary[deposit.metalType].totalQuantity +=
				deposit.remainingQuantity;
			metalSummary[deposit.metalType].totalValue += value;
			metalSummary[deposit.metalType].depositCount += 1;
			metalSummary[deposit.metalType].accounts.add(deposit.accountId);
		});

		// Convert Set to count
		const result = Object.entries(metalSummary).map(([metalType, data]) => ({
			metalType,
			totalQuantity: data.totalQuantity,
			pricePerKg: this.getMetalPrice(metalType),
			totalValue: data.totalValue,
			depositCount: data.depositCount,
			accountCount: data.accounts.size,
		}));

		return {
			metals: result,
			grandTotal: result.reduce((sum, metal) => sum + metal.totalValue, 0),
			prices: METAL_PRICES,
		};
	}

	async getAccountValuationHistory(
		accountId: string,
		startDate?: Date,
		endDate?: Date,
	) {
		// This is a placeholder for future implementation
		// Would require storing historical price data
		throw new Error('Historical valuation not implemented in this version');
	}
}
