import { z } from "zod";

export const KnownIssue = z.object({
	id: z.string(),
	description: z.string(),
	createdAt: z.coerce.date(),
});

export type KnownIssueModel = z.infer<typeof KnownIssue>;

export const CreateKnownIssue = KnownIssue.omit({ id: true, createdAt: true });

export type CreateKnownIssueModel = z.infer<typeof CreateKnownIssue>;
