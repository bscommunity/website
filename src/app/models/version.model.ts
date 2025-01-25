import { z } from "zod";
import { KnownIssue } from "./known-issue.model";

export const Version = z.object({
	id: z.string(),
	chartId: z.string(),
	index: z.number(),
	duration: z.number(),
	notesAmount: z.number(),
	effectsAmount: z.number(),
	bpm: z.number(),
	chartUrl: z.string(),
	downloadsAmount: z.number().optional().default(0),
	knownIssues: KnownIssue.array().optional().default([]),
	publishedAt: z.coerce.date(),
});

export type VersionModel = z.infer<typeof Version>;
