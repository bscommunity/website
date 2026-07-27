import { z } from "zod";

// Enums
import { CatalogItemStatus } from "./enums/catalog-item-status.enum";
import { CatalogItemType } from "./enums/catalog-item-type.enum";
import { Visibility } from "./enums/visibility.enum";

// Models
import { Chart } from "./chart.model";
import { Contributor } from "./contributor.model";
import { StreamingLink } from "./streaming-link.model";

export const TourPass = z.object({
	id: z.string(),
	type: z.enum(CatalogItemType),
	status: z.enum(CatalogItemStatus),
	visibility: z.enum(Visibility),
	isFeatured: z.boolean(),
	downloadsSum: z.number().min(0).default(0),
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

	name: z.string(),
	description: z.string().optional().nullable(),
	artist: z.string().optional().nullable(),
	charts: z.array(Chart).default([]),
	coverUrl: z.string().optional().nullable(),
});

export type TourPassModel = z.infer<typeof TourPass>;

export const CreateTourPass = TourPass.omit({
	id: true,
	type: true,
	status: true,
	visibility: true,
	isFeatured: true,
	downloadsSum: true,
	contributors: true,
	charts: true,
	createdAt: true,
	publishedAt: true,
	updatedAt: true,
	likedAt: true,
	bookmarkedAt: true,
	previewVideoId: true,
	discordChannelId: true,
	discordMessageId: true,
	authorId: true,
}).extend({
	coverUrl: z.string().optional().nullable(),
	previewUrl: z.string().optional().nullable(),
	chartIds: z.array(z.string()).optional().nullable(),
	playlistUrls: z.array(StreamingLink).optional().nullable(),
});

export type CreateTourPassModel = z.infer<typeof CreateTourPass>;
