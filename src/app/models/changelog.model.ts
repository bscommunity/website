import { z } from "zod";

export const Changelog = z.object({
	id: z.string(),
	description: z.string(),
	createdAt: z.coerce.date(),
});

export type ChangelogModel = z.infer<typeof Changelog>;

export const CreateChangelog = Changelog.omit({ id: true, createdAt: true });

export type CreateChangelogModel = z.infer<typeof CreateChangelog>;
