import { z } from "zod";

export const Changelog = z.object({
	id: z.string(),
	description: z.string(),
	createdAt: z.coerce.date(),
});

export type ChangelogModel = z.infer<typeof Changelog>;

export type CreateChangelogModel = {
	description: string;
};

export type CreateChangelogResponseModel = {
	id: string;
};
