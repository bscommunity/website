import { z } from "zod";

// Enums
import { CatalogItemStatus } from "./enums/catalog-item-status.enum";
import { CatalogItemType } from "./enums/catalog-item-type.enum";
import { Visibility } from "./enums/visibility.enum";

// Models
import { Contributor } from "./contributor.model";

export const Theme = z.object({
	id: z.string(),
	type: z.nativeEnum(CatalogItemType),
	status: z.nativeEnum(CatalogItemStatus),
	visibility: z.nativeEnum(Visibility),
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
	replaces: z.string(),
	displayArtUrl: z.string().optional().nullable(),
	previewUrl: z.string().optional().nullable(),
	coverUrl: z.string().optional().nullable(),
});

export type ThemeModel = z.infer<typeof Theme>;
