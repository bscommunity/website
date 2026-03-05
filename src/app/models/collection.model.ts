import { z } from "zod";
import { Chart } from "./chart.model";

export const Collection = z.object({
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	isPublic: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	items: z.array(Chart),
	coverUrl: z.string().optional().nullable(),
	itemCount: z.number(),
});

export type CollectionModel = z.infer<typeof Collection>;
