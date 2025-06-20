import { z } from "zod";

import { KnownIssue } from "./known-issue.model";

export const Version = z.object({
	id: z.string(),
	index: z.number(),
	chartId: z.string(),
	duration: z.number(),
	notesAmount: z.number(),
	effectsAmount: z.number(),
	bpm: z.number(),
	chartUrl: z.string(),
	chartPreviewUrl: z.string().nullable().optional(),
	downloadsAmount: z.number().optional().default(0),
	knownIssues: KnownIssue.array().optional().default([]),
	publishedAt: z.coerce.date(),
});

export type VersionModel = z.infer<typeof Version>;

export const CreateVersion = Version.omit({
	id: true,
	index: true,
	downloadsAmount: true,
	knownIssues: true,
	publishedAt: true,
});
export type CreateVersionModel = z.infer<typeof CreateVersion>;
