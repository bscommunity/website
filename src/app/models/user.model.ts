import { z } from "zod";

export const User = z.object({
	id: z.string(),
	username: z.string(),
	// Contributing users email's are not shown
	email: z.string().email().optional(),
	imageUrl: z.string().optional().nullable(),
	discordId: z.string(),
	createdAt: z.coerce.date(),
});

export type UserModel = z.infer<typeof User>;

export const ContributorUser = User.omit({
	email: true,
	discordId: true,
	id: true,
	createdAt: true,
});

export type ContributorUserModel = z.infer<typeof ContributorUser>;
