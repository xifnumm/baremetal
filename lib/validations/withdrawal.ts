import { z } from 'zod';
import { accountDataSchema } from './account';
import { depositDataSchema } from './deposit';

export const withdrawalDataSchema = z.object({
	id: z.cuid(),
	account: accountDataSchema,
	accountID: accountDataSchema.shape.id,
	deposit: depositDataSchema.nullable(),
	depositId: z.cuid().nullable(),
	withdrawalNumber: z.string().min(1, 'Withdrawal number is required'),
	metalType: z.string().min(1, 'Metal type is required'),
	storageType: z.enum(['ALLOCATED', 'UNALLOCATED']),
	quantity: z.number().positive('Quantity must be greater than 0'),
	barSerial: z.string().optional().nullable(),
	withdrawnAt: z.date(),
});

// Schema for creating a withdrawal (without generated fields)
export const createWithdrawalSchema = z
	.object({
		accountId: z.cuid('Invalid account ID'),
		withdrawalNumber: z
			.string()
			.min(1, 'Withdrawal number is required')
			.max(50),
		metalType: z.enum(['Gold', 'Silver', 'Platinum']),
		storageType: z.enum(['ALLOCATED', 'UNALLOCATED']),
		quantity: z
			.number()
			.positive('Quantity must be greater than 0')
			.finite('Quantity must be a valid number')
			.max(100000, 'Quantity cannot exceed 100,000 kg'),
		barSerial: z
			.string()
			.max(100, 'Bar serial cannot exceed 100 characters')
			.optional(),
	})
	.refine(
		(data) => {
			// If storage type is ALLOCATED, barSerial can be optional (system picks)
			// If storage type is UNALLOCATED, barSerial should not be provided
			if (data.storageType === 'UNALLOCATED' && data.barSerial) {
				return false;
			}
			return true;
		},
		{
			message: 'Bar serial should not be provided for UNALLOCATED storage',
			path: ['barSerial'],
		},
	);

// Schema for updating a withdrawal (if needed for admin corrections)
export const updateWithdrawalSchema = z.object({
	withdrawalNumber: z.string().min(1).max(50).optional(),
	metalType: z.enum(['Gold', 'Silver', 'Platinum']).optional(),
	quantity: z.number().positive().max(100000).optional(),
	barSerial: z.string().max(100).optional().nullable(),
});

// Type inference
export type WithdrawalData = z.infer<typeof withdrawalDataSchema>;
export type CreateWithdrawalData = z.infer<typeof createWithdrawalSchema>;
export type UpdateWithdrawalData = z.infer<typeof updateWithdrawalSchema>;
