import { z } from "zod";

// Enums
import { Difficulty } from "./enums/difficulty.enum";
import { Genre } from "./enums/genre.enum";

// Models
import { Contributor } from "./contributor.model";
import { Version } from "./version.model";
import { StreamingLink } from "./streaming-link.model";

export const Chart = z.object({
	id: z.string(),
	artist: z.string(),
	track: z.string(),
	genre: z.nativeEnum(Genre).optional(),
	coverUrl: z.string(),
	difficulty: z.nativeEnum(Difficulty),
	isDeluxe: z.boolean().default(false),
	isExplicit: z.boolean().default(false),
	isFeatured: z.boolean().default(false),
	isPublic: z.boolean().default(true),

	// Relations
	versions: Version.array().optional(),
	contributors: z.array(Contributor).optional(),
});

const ChartWithLatestVersion = Chart.extend({
	latestVersion: Version.optional(),
});

export type ChartModel = z.infer<typeof Chart>;
export type ChartWithLatestVersionModel = z.infer<
	typeof ChartWithLatestVersion
>;

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
			chartUrl: true,
			chartPreviewUrl: true,
			duration: true,
			notesAmount: true,
			effectsAmount: true,
			bpm: true,
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
