import { z } from "zod";

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
	changelog: z.string().optional().default(""),
});
export type CreateVersionModel = z.infer<typeof CreateVersion>;
