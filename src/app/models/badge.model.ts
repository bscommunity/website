import { z } from "zod";

export const Badge = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	criteria: z.string().nullable(),
	createdAt: z.coerce.date(),
});

export type BadgeModel = z.infer<typeof Badge>;
