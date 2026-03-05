import { z } from "zod";

export const Changelog = z.object({
	// Assuming basic structure, update as needed
	id: z.string(),
	description: z.string(),
	createdAt: z.coerce.date(),
});

export type ChangelogModel = z.infer<typeof Changelog>;
