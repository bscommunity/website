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
	genre: z.enum(Genre).optional(),
	coverUrl: z.string(),
	isFeatured: z.boolean().default(false),
	isPublic: z.boolean().default(true),

	// Relations
	latestVersion: Version,
	versions: Version.array().min(1),
	contributors: z.array(Contributor).optional(),
});

export type ChartModel = z.infer<typeof Chart>;

/**
 * Returns a ChartModel with the latest version included
 */
export function withLatestVersion(
	chart: Omit<ChartModel, "latestVersion">,
): ChartModel {
	return {
		...chart,
		latestVersion: chart.versions[chart.versions.length - 1],
	};
}

export const CreateChart = Chart.omit({
	id: true,
	isFeatured: true,
	isPublic: true,
	versions: true,
	contributors: true,
	contentId: true,
	latestVersion: true,
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
}).partial();
export type MutateChartModel = z.infer<typeof MutateChartSchema>;
