import { z } from "zod";
import { Chart } from "./chart.model";
import { Collection } from "./collection.model";

export const User = z.object({
	id: z.string(),
	username: z.string(),
	// Contributing users email's are not shown
	email: z.email().optional(),
	imageUrl: z.string().optional().nullable(),
	discordId: z.string(),
	createdAt: z.coerce.date(),
});

export type UserModel = z.infer<typeof User>;

export const SimplifiedUser = User.omit({
	email: true,
	discordId: true,
	createdAt: true,
});

export type SimplifiedUserModel = z.infer<typeof SimplifiedUser>;

export const UserProfileResponse = z.object({
	user: SimplifiedUser,
	// followersCount: z.number(),
	// followingCount: z.number(),
	// isFollowing: z.boolean(),
	charts: z.array(Chart),
	collections: z.array(Collection),
	likes: z.array(Chart),
	bookmarks: z.array(Chart),
	stats: z.object({
		totalCharts: z.number(),
		totalCollections: z.number(),
	}),
});

export type UserProfileResponseModel = z.infer<typeof UserProfileResponse>;
