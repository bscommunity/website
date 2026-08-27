import { z } from "zod";
import { Difficulty } from "./enums/difficulty.enum";

export const Version = z.object({
	id: z.string(),
	catalogItemId: z.string(),
	versionCode: z.number().int(),
	downloadsAmount: z.number().min(0).default(0),
	fileSizeBytes: z.number().int(),
	changelog: z.string().nullable(),
	createdAt: z.coerce.date(),
	discordAttachmentId: z.string().optional().nullable(),
});

export type VersionModel = z.infer<typeof Version>;

export const CreateVersion = z.object({
	track: z.string(),
	artist: z.string(),
	duration: z.number(),
	notesAmount: z.number().int(),
	effectsAmount: z.number().int(),
	bpm: z.number().int(),
	difficulty: z.enum(Difficulty),
	isDeluxe: z.boolean(),
	isExplicit: z.boolean(),
	bundleUrl: z.string().optional().default(""),
	fileSizeBytes: z.number().int().optional().default(0),
	changelog: z.string().optional().default(""),
	chartBundle: z.instanceof(File).optional(),
});
export type CreateVersionModel = z.infer<typeof CreateVersion>;
