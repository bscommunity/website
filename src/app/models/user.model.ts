import { z } from "zod";
import { Chart } from "./chart.model";
import type { ChartModel } from "./chart.model";
import { Collection } from "./collection.model";

// Enums
import { UserRole } from "./enums/role.enum";

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

export interface UserActivityItemModel {
	id?: string;
	type?: string;
	action?: string;
	label?: string;
	createdAt?: string | Date;
	date?: string | Date;
	occurredAt?: string | Date;
	items?: ChartModel[];
	charts?: ChartModel[];
	data?: ChartModel[];
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
	followerCount: z.number().int(),
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
	followerCount: true,
	followingCount: true,
	badges: true,
});

export type SimplifiedUserModel = z.infer<typeof SimplifiedUser>;

export const UserProfileResponse = z.object({
	user: SimplifiedUser,
	followersCount: z.number().optional(),
	followingCount: z.number().optional(),
	isFollowing: z.boolean().optional(),
	counts: z
		.object({
			charts: z.number().optional(),
			tourPasses: z.number().optional(),
			themes: z.number().optional(),
			collections: z.number().optional(),
		})
		.optional(),
	charts: z.array(Chart).optional(),
	collections: z.array(Collection).optional(),
	likes: z.array(Chart).optional(),
	bookmarks: z.array(Chart).optional(),
	stats: z
		.object({
			totalCharts: z.number(),
			totalCollections: z.number(),
		})
		.optional(),
});

export type UserProfileResponseModel = z.infer<typeof UserProfileResponse>;
