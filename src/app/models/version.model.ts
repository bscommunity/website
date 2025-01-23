import { z } from "zod";

export const Version = z.object({
	index: z.number(),
	duration: z.number(),
	notesAmount: z.number(),
	chartUrl: z.string(),
	downloadsAmount: z.number().optional(),
	known_issues: z.string().array(),
	publishedAt: z.coerce.date(),
});

export type VersionModel = z.infer<typeof Version>;
