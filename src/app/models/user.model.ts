import { z } from "zod";
import { Chart } from "./chart.model";
import type { ChartModel } from "./chart.model";
import { Collection } from "./collection.model";

// Enums
import { UserRole } from "./enums/role.enum";

export enum ActivityType {
	LIKED_CHART = "LIKED_CHART",
	CREATED_CHART = "CREATED_CHART",
	BOOKMARKED_CHART = "BOOKMARKED_CHART",
	FOLLOWED_USER = "FOLLOWED_USER",
}

export interface ActivityItemResponse {
	id: string;
	type: ActivityType;
	createdAt: string;
}

export interface ChartActivityItem extends ActivityItemResponse {
	chart: ChartModel;
}

export interface ContentCountsModel {
	charts?: number;
	tourPasses?: number;
	themes?: number;
	collections?: number;
}

export interface ItemsPageModel<T> {
	items: T[];
	counts?: ContentCountsModel | null;
}

export const User = z.object({
	id: z.string(), // Assuming UUID as string
	username: z.string(),
	email: z.email(),
	bannerUrl: z.string().optional().nullable(),
	avatarUrl: z.string().optional().nullable(),
	accentColor: z.number().int().optional().nullable(),
	bio: z.string().optional().nullable(),
	isPublic: z.boolean(),
	role: z.enum(UserRole),
	isVerified: z.boolean(),
	verifiedAt: z.coerce.date().optional().nullable(),
	discordId: z.string(),
	createdAt: z.coerce.date(),
	followersCount: z.number().int(),
	followingCount: z.number().int(),
	badges: z.array(z.any()).optional(), // Assuming Badge model, update if needed
});

export type UserModel = z.infer<typeof User>;

export const SimplifiedUser = User.omit({
	email: true,
	discordId: true,
	createdAt: true,
	role: true,
	isVerified: true,
	verifiedAt: true,
	badges: true,
});

export type SimplifiedUserModel = z.infer<typeof SimplifiedUser>;

export const UserProfileResponse = z.object({
	user: SimplifiedUser,
	isFollowing: z.boolean().optional(),
});

export type UserProfileResponseModel = z.infer<typeof UserProfileResponse>;
