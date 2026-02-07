import { z } from 'zod';

export const withdrawalDataSchema = z.object({
	id: z.string(),
});
