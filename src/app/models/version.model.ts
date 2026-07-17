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

export const CreateVersion = Version.omit({
	id: true,
	downloadsAmount: true,
	createdAt: true,
	discordAttachmentId: true,
}).extend({
	chartBundle: z.instanceof(File).optional(),
});
export type CreateVersionModel = z.infer<typeof CreateVersion>;
