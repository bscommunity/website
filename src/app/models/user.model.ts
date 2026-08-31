import { z } from "zod";

// Enums
import { ActivityType } from "./enums/activity-type.enum";
import { UserRole } from "./enums/role.enum";

// Models
import { Badge } from "./badge.model";
import type { ChartModel } from "./chart.model";

export type ContributorInvitePolicy = "EVERYONE" | "FOLLOWING" | "NOBODY";

export const User = z.object({
	id: z.string(),
	username: z.string(),
	email: z.string(),
	bannerUrl: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	accentColor: z.number().int().nullable(),
	bio: z.string().nullable(),
	isPublic: z.boolean(),
	role: z.nativeEnum(UserRole),
	isVerified: z.boolean(),
	verifiedAt: z.coerce.date().nullable(),
	discordId: z.string(),
	createdAt: z.coerce.date(),
	followerCount: z.number().int(),
	followingCount: z.number().int(),
	badges: z.array(Badge).optional().nullable(),
	allowContributorInvitesFrom: z
		.enum(["EVERYONE", "FOLLOWING", "NOBODY"])
		.default("EVERYONE")
		.optional(),
});

export type UserModel = z.infer<typeof User>;

export const SimplifiedUser = User.pick({
	id: true,
	username: true,
	avatarUrl: true,
	bannerUrl: true,
	bio: true,
	accentColor: true,
	isVerified: true,
}).extend({
	followersCount: z.number().int().optional().nullable(),
	followingCount: z.number().int().optional().nullable(),
});

export type SimplifiedUserModel = z.infer<typeof SimplifiedUser>;

export const UserProfileResponse = z.object({
	user: SimplifiedUser,
	isFollowing: z.boolean().optional().nullable(),
});

export type UserProfileResponseModel = z.infer<typeof UserProfileResponse>;

export const ContentCounts = z.object({
	charts: z.number().int().default(0),
	tourPasses: z.number().int().default(0),
	themes: z.number().int().default(0),
	collections: z.number().int().default(0),
});

export type ContentCountsModel = z.infer<typeof ContentCounts>;

export interface ActivityItemResponse {
	id: string;
	type: ActivityType;
	createdAt: string;
}

export interface ChartActivityItem extends ActivityItemResponse {
	chart: ChartModel;
}

export interface UserActivityItem extends ActivityItemResponse {
	chart?: ChartModel | null;
	user?: SimplifiedUserModel | null;
	followedUser?: SimplifiedUserModel | null;
	targetUser?: SimplifiedUserModel | null;
}

export const ItemsPage = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		items: z.array(itemSchema),
		counts: ContentCounts.optional().nullable(),
	});

export type ItemsPageModel<T> = {
	items: T[];
	counts?: ContentCountsModel | null;
};
