import { z } from 'zod';

// Schema for validating metal prices
export const metalPriceSchema = z.object({
	metalType: z.enum(['Gold', 'Silver', 'Platinum']),
	pricePerKg: z
		.number()
		.positive('Price must be greater than 0')
		.finite('Price must be a valid number')
		.max(1000000, 'Price cannot exceed 1,000,000 per kg'),
	lastUpdated: z.date().optional(),
});

// Schema for all metal prices
export const metalPricesSchema = z.object({
	Gold: z.number().positive(),
	Silver: z.number().positive(),
	Platinum: z.number().positive(),
});

// Schema for valuation query parameters
export const valuationQuerySchema = z.object({
	accountId: z.cuid('Invalid account ID').optional(),
	metalType: z.enum(['Gold', 'Silver', 'Platinum']).optional(),
	includeBreakdown: z.boolean().default(true),
	includeSummary: z.boolean().default(true),
});

// Type inference
export type MetalPriceData = z.infer<typeof metalPriceSchema>;
export type MetalPricesData = z.infer<typeof metalPricesSchema>;
export type ValuationQueryData = z.infer<typeof valuationQuerySchema>;
