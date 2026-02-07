import { z } from 'zod';
import { withdrawalDataSchema } from './withdrawal';
import { depositDataSchema } from './deposit';

export const accountDataSchema = z.object({
	id: z.string(),
	email: z.email(),
	name: z.string(),
	clientType: z.enum(['RETAIL', 'INSITUTIONAL']),
	createdAt: z.date(),
	withdrawal: withdrawalDataSchema,
	deposit: depositDataSchema,
});
