import { z } from "zod";

// Enums
import { Genre } from "./enums/genre.enum";

// Models
import { Contributor } from "./contributor.model";
import { CreateVersion, Version } from "./version.model";
import { StreamingLink } from "./streaming-link.model";

export const Chart = z.object({
	id: z.string(),
	contentId: z.string(),
	artist: z.string(),
	track: z.string(),
	album: z.string().optional().nullable(),
	genre: z.enum(Genre).optional().nullable(),
	coverUrl: z.string(),
	trackPreviewUrl: z.string().optional().nullable(),
	isFeatured: z.boolean().default(false),
	isPublic: z.boolean().default(true),

	downloadsSum: z.number().min(0).default(0),

	// Relations
	latestVersion: Version,
	versions: Version.array().default([]),
	contributors: z.array(Contributor).default([]),
	trackUrls: z.array(StreamingLink).default([]),

	// Timestamps
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	likedAt: z.coerce.date().optional().nullable(),
	bookmarkedAt: z.coerce.date().optional().nullable(),
});

export type ChartModel = z.infer<typeof Chart>;

export const CreateChart = Chart.omit({
	id: true,
	isFeatured: true,
	isPublic: true,
	versions: true,
	contributors: true,
	contentId: true,
	latestVersion: true,
	downloadsSum: true,
	createdAt: true,
	updatedAt: true,
	likedAt: true,
	bookmarkedAt: true,
})
	.merge(
		// First version properties
		CreateVersion,
	)
	.extend({
		// Additional properties for creation
		album: z.string().optional().nullable(),
		trackPreviewUrl: z.string().optional().nullable(),
		trackUrls: z.array(StreamingLink).optional(),
		chartBundle: z.any().optional().nullable(),
	});

export type CreateChartModel = z.infer<typeof CreateChart>;

export const MutateChartSchema = Chart.omit({
	id: true,
	isFeatured: true,
	versions: true,
	contributors: true,
	latestVersion: true,
	downloadsSum: true,
	createdAt: true,
	updatedAt: true,
	likedAt: true,
	bookmarkedAt: true,
}).partial();
export type MutateChartModel = z.infer<typeof MutateChartSchema>;
