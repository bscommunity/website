import { z } from "zod";

// Enums
import { Difficulty } from "./enums/difficulty.enum";

// Models
import { Changelog } from "./changelog.model";

export const Version = z.object({
	id: z.string(),
	index: z.number(),
	chartId: z.string(),
	duration: z.number(),
	notesAmount: z.number(),
	effectsAmount: z.number(),
	bpm: z.number(),
	difficulty: z.nativeEnum(Difficulty),
	isDeluxe: z.boolean().default(false),
	isExplicit: z.boolean().default(false),
	bundleUrl: z.string(),
	previewUrl: z.string().nullable(),
	downloadsAmount: z.number().default(0),
	changelog: Changelog.array().default([]),
	createdAt: z.coerce.date(),
});

export type VersionModel = z.infer<typeof Version>;

export const CreateVersion = Version.omit({
	id: true,
	chartId: true,
	index: true,
	downloadsAmount: true,
	changelog: true,
	createdAt: true,
}).extend({
	chartBundle: z.instanceof(File).optional(),
});

export type CreateVersionModel = z.infer<typeof CreateVersion>;
