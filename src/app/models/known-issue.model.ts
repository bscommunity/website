import { z } from "zod";

export const KnownIssue = z.object({
	index: z.number(),
	description: z.string(),
	createdAt: z.coerce.date(),
});

export type KnownIssueModel = z.infer<typeof KnownIssue>;
