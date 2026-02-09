import { z } from 'zod';

export const accountDataSchema = z.object({
	id: z.cuid(),
	email: z.email('Invalid email address'),
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['RETAIL', 'INSTITUTIONAL']),
	createdAt: z.date(),
	deposits: z.array(z.any()).default([]),
	withdrawals: z.array(z.any()).default([]),
});

// Schema for creating an account
export const createAccountSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Invalid email address')
		.max(255, 'Email cannot exceed 255 characters'),
	name: z
		.string()
		.min(1, 'Name is required')
		.max(255, 'Name cannot exceed 255 characters')
		.trim(),
	type: z.enum(['RETAIL', 'INSTITUTIONAL']),
});

// Schema for updating an account
export const updateAccountSchema = z
	.object({
		email: z
			.email('Invalid email address')
			.max(255, 'Email cannot exceed 255 characters')
			.optional(),
		name: z
			.string()
			.min(1, 'Name cannot be empty')
			.max(255, 'Name cannot exceed 255 characters')
			.trim()
			.optional(),
	})
	.refine((data) => data.email || data.name, {
		message: 'At least one field must be provided for update',
	});

// Type inference
export type AccountData = z.infer<typeof accountDataSchema>;
export type CreateAccountData = z.infer<typeof createAccountSchema>;
export type UpdateAccountData = z.infer<typeof updateAccountSchema>;
