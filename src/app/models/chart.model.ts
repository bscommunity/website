import { z } from "zod";

// Enums
import { CatalogItemStatus } from "./enums/catalog-item-status.enum";
import { CatalogItemType } from "./enums/catalog-item-type.enum";
import { Difficulty } from "./enums/difficulty.enum";
import { Visibility } from "./enums/visibility.enum";

// Models
import { Contributor } from "./contributor.model";
import { Track } from "./track.model";
import { Version } from "./version.model";

export const Chart = z.object({
	id: z.string(),
	type: z.enum(CatalogItemType).default(CatalogItemType.CHART),
	status: z.enum(CatalogItemStatus),
	visibility: z.enum(Visibility),
	isFeatured: z.boolean(),
	downloadsSum: z.number().min(0).default(0),
	likesCount: z.number().min(0).default(0),
	bookmarksCount: z.number().min(0).default(0),
	contributors: z.array(Contributor).default([]),
	createdAt: z.coerce.date(),
	publishedAt: z.coerce.date().optional().nullable(),
	updatedAt: z.coerce.date().optional().nullable(),
	likedAt: z.coerce.date().optional().nullable(),
	bookmarkedAt: z.coerce.date().optional().nullable(),
	previewVideoId: z.string().optional().nullable(),
	discordChannelId: z.string().optional().nullable(),
	discordMessageId: z.string().optional().nullable(),
	authorId: z.string().optional().nullable(),

	track: Track,
	versionsCount: z.number().int(),
	versions: z.array(Version).default([]),
	difficulty: z.enum(Difficulty),
	notesAmount: z.number().int(),
	effectsAmount: z.number().int(),
	isDeluxe: z.boolean().default(false),
	isExplicit: z.boolean().default(false),
	latestVersion: Version.nullable(),
});

export type ChartModel = z.infer<typeof Chart>;

export const CreateChart = Chart.omit({
	id: true,
	isFeatured: true,
	contributors: true,
	type: true,
	status: true,
	visibility: true,
	latestVersion: true,
	versions: true,
	downloadsSum: true,
	likesCount: true,
	bookmarksCount: true,
	createdAt: true,
	publishedAt: true,
	updatedAt: true,
	likedAt: true,
	bookmarkedAt: true,
	previewVideoId: true,
	discordChannelId: true,
	discordMessageId: true,
	authorId: true,
	versionsCount: true,
}).extend({
	chartBundle: z.instanceof(File).optional(),
});

export type CreateChartModel = z.infer<typeof CreateChart>;

export const MutateChartSchema = Chart.omit({
	id: true,
	isFeatured: true,
	contributors: true,
	latestVersion: true,
	versions: true,
	downloadsSum: true,
	likesCount: true,
	bookmarksCount: true,
	createdAt: true,
	publishedAt: true,
	updatedAt: true,
	likedAt: true,
	bookmarkedAt: true,
	previewVideoId: true,
	discordChannelId: true,
	discordMessageId: true,
	authorId: true,
	versionsCount: true,
}).partial();
export type MutateChartModel = z.infer<typeof MutateChartSchema>;
