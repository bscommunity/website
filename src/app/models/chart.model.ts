import { z } from "zod";
import { Difficulty } from "./enums/difficulty.enum";
import { Contributor } from "./contributor.model";
import { Version } from "./version.model";

export const Chart = z.object({
	id: z.string(),
	artist: z.string(),
	track: z.string(),
	coverUrl: z.string(),
	difficulty: z.nativeEnum(Difficulty),
	isDeluxe: z.boolean(),
	isExplicit: z.boolean(),
	isFeatured: z.boolean(),
	versions: Version.array(),
	contributors: Contributor.array(),
	knownIssues: z.string().array(),
});

export type ChartModel = z.infer<typeof Chart>;

const chartSchema = Chart.omit({
	id: true,
	versions: true,
	contributors: true,
	knownIssues: true,
	isFeatured: true,
});
export type MutateChartModel = z.infer<typeof chartSchema>;
