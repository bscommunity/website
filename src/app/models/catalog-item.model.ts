import { z } from "zod";

// Models
import { Contributor } from "./contributor.model";

export const CatalogItem = z.object({
	id: z.string(),
	contentId: z.string(),
	coverUrl: z.string(),
	isPublic: z.boolean(),
	isFeatured: z.boolean(),
	downloadsSum: z.number().min(0).default(0),
	contributors: z.array(Contributor).default([]),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	likedAt: z.coerce.date().optional().nullable(),
	bookmarkedAt: z.coerce.date().optional().nullable(),
});

export type CatalogItemModel = z.infer<typeof CatalogItem>;
