import { z } from "zod";

// Enums
import { Genre } from "./enums/genre.enum";

// Models
import { Contributor } from "./contributor.model";
import { Version } from "./version.model";
import { StreamingLink } from "./streaming-link.model";

// Types
import type { VersionModel } from "./version.model";

export const Chart = z.object({
	id: z.string(),
	artist: z.string(),
	track: z.string(),
	genre: z.nativeEnum(Genre).optional(),
	coverUrl: z.string(),
	isFeatured: z.boolean().default(false),
	isPublic: z.boolean().default(true),

	// Relations
	versions: Version.array().min(1),
	contributors: z.array(Contributor).optional(),
});

export type ChartModel = z.infer<typeof Chart>;

export type ChartModelWithLatestVersion = Omit<ChartModel, "latestVersion"> & {
	latestVersion: VersionModel;
};

/**
 * Returns a ChartModelWithLatestVersion, ensuring latestVersion is filled.
 */
export function withLatestVersion(
	chart: Omit<ChartModel, "latestVersion">,
): ChartModelWithLatestVersion {
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
})
	.merge(
		// First version properties
		Version.pick({
			bundleUrl: true,
			previewUrl: true,
			duration: true,
			notesAmount: true,
			effectsAmount: true,
			bpm: true,
			difficulty: true,
			isDeluxe: true,
			isExplicit: true,
		}),
	)
	.extend({
		// Additional properties for creation
		album: z.string().optional().nullable(),
		trackPreviewUrl: z.string().optional().nullable(),
		trackUrls: z.array(StreamingLink).optional(),
	});

export type CreateChartModel = z.infer<typeof CreateChart>;

const chartSchema = Chart.omit({
	id: true,
	isFeatured: true,
	versions: true,
	contributors: true,
}).partial();
export type MutateChartModel = z.infer<typeof chartSchema>;
