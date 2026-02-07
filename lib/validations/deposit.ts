import { z } from 'zod';
import { accountDataSchema } from './account';

export const depositDataSchema = z.object({
	id: z.string(),
	accountId: accountDataSchema.shape.id,
	depositNumber: z.string(),
	metalType: z.string(),
	storageType: z.enum(['ALLOCATED', 'UNALLOCATED']),
	quantity: z.float64(),
	barSerial: z.string().optional(),
	depositedAt: z.date(),
});
