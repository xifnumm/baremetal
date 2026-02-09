import { z } from 'zod';
import { accountDataSchema } from './account';

export const depositDataSchema = z.object({
	id: z.cuid(),
	account: accountDataSchema,
	accountId: accountDataSchema.shape.id,
	depositNumber: z.string().min(1, 'Deposit number is required'),
	metalType: z.string().min(1, 'Metal type is required'),
	storageType: z.enum(['ALLOCATED', 'UNALLOCATED']),
	quantity: z.number().positive('Quantity must be greater than 0'),
	remainingQuantity: z
		.number()
		.nonnegative('Remaining quantity cannot be negative'),
	barSerial: z.string().optional().nullable(),
	depositedAt: z.date(),
	withdrawals: z.array(z.any()).default([]),
});

// Schema for creating a deposit
export const createDepositSchema = z
	.object({
		accountId: z.string().cuid('Invalid account ID'),
		depositNumber: z
			.string()
			.min(1, 'Deposit number is required')
			.max(50, 'Deposit number cannot exceed 50 characters'),
		metalType: z.enum(['Gold', 'Silver', 'Platinum']),
		storageType: z.enum(['ALLOCATED', 'UNALLOCATED']),
		quantity: z
			.number()
			.positive('Quantity must be greater than 0')
			.max(100000, 'Quantity cannot exceed 100,000 kg'),
		barSerial: z
			.string()
			.min(1, 'Bar serial is required for allocated storage')
			.max(100, 'Bar serial cannot exceed 100 characters')
			.optional(),
	})
	.refine(
		(data) => {
			// If storage type is ALLOCATED, barSerial is required
			if (data.storageType === 'ALLOCATED' && !data.barSerial) {
				return false;
			}
			// If storage type is UNALLOCATED, barSerial should not be provided
			if (data.storageType === 'UNALLOCATED' && data.barSerial) {
				return false;
			}
			return true;
		},
		{
			message:
				'Bar serial is required for ALLOCATED storage and should not be provided for UNALLOCATED storage',
			path: ['barSerial'],
		},
	);

// Schema for updating a deposit (if needed for admin corrections)
export const updateDepositSchema = z.object({
	depositNumber: z.string().min(1).max(50).optional(),
	metalType: z.enum(['Gold', 'Silver', 'Platinum']).optional(),
	quantity: z.number().positive().max(100000).optional(),
	remainingQuantity: z.number().nonnegative().max(100000).optional(),
	barSerial: z.string().max(100).optional().nullable(),
});

// Type inference
export type DepositData = z.infer<typeof depositDataSchema>;
export type CreateDepositData = z.infer<typeof createDepositSchema>;
export type UpdateDepositData = z.infer<typeof updateDepositSchema>;
