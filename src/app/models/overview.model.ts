import { z } from "zod";
import { CatalogItemType } from "./enums/catalog-item-type.enum";

export const TypeBreakdown = z.object({
	charts: z.number().int().default(0),
	tourPasses: z.number().int().default(0),
	themes: z.number().int().default(0),
});

export type TypeBreakdownModel = z.infer<typeof TypeBreakdown>;

export const TrendIndicator = z.object({
	value: z.string(),
});

export type TrendIndicatorModel = z.infer<typeof TrendIndicator>;

export const OverviewStat = z.object({
	total: z.number().int(),
	byType: TypeBreakdown,
	trend: TrendIndicator.nullish(),
});

export type OverviewStatModel = z.infer<typeof OverviewStat>;

export const LatestUpdate = z.object({
	catalogItemId: z.string(),
	name: z.string(),
	type: z.nativeEnum(CatalogItemType),
	versionCode: z.number().int(),
	publishedAt: z.coerce.date(),
});

export type LatestUpdateModel = z.infer<typeof LatestUpdate>;

export const OverviewUpdates = z.object({
	total: z.number().int(),
	byType: TypeBreakdown,
	latestUpdate: LatestUpdate.nullish(),
});

export type OverviewUpdatesModel = z.infer<typeof OverviewUpdates>;

export const OverviewDownloads = z.object({
	total: z.number().int(),
	trendPercent: z.number().nullish(),
	byType: TypeBreakdown,
	dailyBreakdown: z
		.array(
			z.object({
				date: z.string(),
				charts: z.number().int().default(0),
				tourPasses: z.number().int().default(0),
				themes: z.number().int().default(0),
			}),
		)
		.default([]),
});

export type OverviewDownloadsModel = z.infer<typeof OverviewDownloads>;

export const OverviewFeedItem = z.object({
	id: z.string(),
	type: z.string(),
	catalogItemId: z.string(),
	contentType: z.nativeEnum(CatalogItemType),
	contentName: z.string(),
	createdAt: z.coerce.date(),
});

export type OverviewFeedItemModel = z.infer<typeof OverviewFeedItem>;

export const TopContentItem = z.object({
	catalogItemId: z.string(),
	name: z.string(),
	type: z.nativeEnum(CatalogItemType),
	downloads: z.number().int(),
});

export type TopContentItemModel = z.infer<typeof TopContentItem>;

export const OverviewFeedback = z.object({
	totalLikes: z.number().int(),
	totalBookmarks: z.number().int(),
	topContent: z.array(TopContentItem),
});

export type OverviewFeedbackModel = z.infer<typeof OverviewFeedback>;

export const OverviewResponse = z.object({
	published: OverviewStat,
	contributed: OverviewStat,
	updates: OverviewUpdates,
	downloads: OverviewDownloads,
	activityFeed: z.array(OverviewFeedItem),
	feedback: OverviewFeedback,
});

export type OverviewResponseModel = z.infer<typeof OverviewResponse>;
