import { z } from "zod";

// Enums
import { CatalogItemStatus } from "./enums/catalog-item-status.enum";
import { CatalogItemType } from "./enums/catalog-item-type.enum";
import { Visibility } from "./enums/visibility.enum";

// Models
import { Contributor } from "./contributor.model";
import { Version } from "./version.model";

export const Theme = z.object({
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
	likesCount: z.number().default(0),
	bookmarksCount: z.number().default(0),
	previewVideoId: z.string().optional().nullable(),
	discordChannelId: z.string().optional().nullable(),
	discordMessageId: z.string().optional().nullable(),
	authorId: z.string().optional().nullable(),

	name: z.string(),
	coverUrl: z.string(),
	displayArtUrl: z.string(),
	replaces: z.string(),
	originalArtwork: z.string().optional().nullable(),
	previewUrl: z.string().optional().nullable(),

	versionsCount: z.number().int().default(0),
	latestVersion: Version.nullable().optional(),
});

export type ThemeModel = z.infer<typeof Theme>;

export const CreateTheme = Theme.omit({
	id: true,
	type: true,
	status: true,
	visibility: true,
	isFeatured: true,
	downloadsSum: true,
	contributors: true,
	createdAt: true,
	publishedAt: true,
	updatedAt: true,
	likedAt: true,
	bookmarkedAt: true,
	likesCount: true,
	bookmarksCount: true,
	previewVideoId: true,
	discordChannelId: true,
	discordMessageId: true,
	authorId: true,
	originalArtwork: true,
	displayArtUrl: true,
	coverUrl: true,
	versionsCount: true,
	latestVersion: true,
}).extend({
	previewUrl: z.string().optional().nullable(),
});

export type CreateThemeModel = z.infer<typeof CreateTheme>;
