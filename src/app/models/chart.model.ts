import { z } from "zod";
import { Difficulty } from "./enums/difficulty.enum";
import { Contributor } from "./contributor.model";
import { Version } from "./version.model";

export const Chart = z.object({
	id: z.string(),
	artist: z.string(),
	track: z.string(),
	album: z.string(),
	coverUrl: z.string(),
	trackUrl: z.string(),
	trackPreviewUrl: z.string(),
	difficulty: z.nativeEnum(Difficulty),
	isDeluxe: z.boolean().default(false),
	isExplicit: z.boolean().default(false),
	isFeatured: z.boolean().default(false),

	// Relations
	latestVersion: Version.optional(),
	versions: Version.array(),
	contributors: z.array(Contributor).optional(),
});

export type ChartModel = z.infer<typeof Chart>;

export const CreateChartModel = Chart.omit({
	id: true,
	isFeatured: true,
	versions: true,
	contributors: true,
}).merge(
	// First version properties
	z.object({
		chartUrl: z.string(),
		chartPreviewUrl: z.string().optional(),
		duration: z.number(),
		notesAmount: z.number(),
		effectsAmount: z.number(),
		bpm: z.number(),
	}),
);
export type CreateChartModel = z.infer<typeof CreateChartModel>;

const chartSchema = Chart.omit({
	id: true,
	isFeatured: true,
	versions: true,
	contributors: true,
});
export type MutateChartModel = z.infer<typeof chartSchema>;
