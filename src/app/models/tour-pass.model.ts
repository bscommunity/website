import { z } from "zod";

// Models
import { Chart } from "./chart.model";

export const TourPass = z.object({
	id: z.string(),
	contentId: z.string(),
	name: z.string(),
	description: z.string().optional().nullable(),
	artist: z.string().optional().nullable(),
	coverUrl: z.string(),
	charts: z.array(Chart).default([]),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	likedAt: z.coerce.date().optional().nullable(),
	bookmarkedAt: z.coerce.date().optional().nullable(),
});

export type TourPassModel = z.infer<typeof TourPass>;

export const CreateTourPass = TourPass.omit({
	id: true,
	contentId: true,
	charts: true,
	createdAt: true,
	updatedAt: true,
	likedAt: true,
	bookmarkedAt: true,
}).extend({
	chartIds: z.array(z.string()).optional().nullable(),
});

export type CreateTourPassModel = z.infer<typeof CreateTourPass>;
