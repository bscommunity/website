import { z } from "zod";
import { Difficulty } from "./enums/difficulty.enum";
import { Contributor } from "./contributor.model";
import { Version } from "./version.model";
import { StreamingLink } from "./streaming-link.model";

export const Chart = z.object({
	id: z.string(),
	artist: z.string(),
	track: z.string(),
	album: z.string().optional(),
	coverUrl: z.string(),
	trackUrls: z.array(StreamingLink).optional(),
	trackPreviewUrl: z.string().optional(),
	difficulty: z.nativeEnum(Difficulty),
	isDeluxe: z.boolean().default(false),
	isExplicit: z.boolean().default(false),
	isFeatured: z.boolean().default(false),

	// Relations
	latestVersion: Version,
	versions: Version.array().optional(),
	contributors: z.array(Contributor).optional(),
});

export type ChartModel = z.infer<typeof Chart>;

export const CreateChart = Chart.omit({
	id: true,
	isFeatured: true,
	versions: true,
	contributors: true,
	latestVersion: true,
}).merge(
	// First version properties
	Version.pick({
		chartUrl: true,
		chartPreviewUrls: true,
		duration: true,
		notesAmount: true,
		effectsAmount: true,
		bpm: true,
	}),
);
export type CreateChartModel = z.infer<typeof CreateChart>;

const chartSchema = Chart.omit({
	id: true,
	isFeatured: true,
	versions: true,
	contributors: true,
});
export type MutateChartModel = z.infer<typeof chartSchema>;
