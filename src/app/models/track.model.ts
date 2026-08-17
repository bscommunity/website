import { z } from "zod";
import { Genre } from "./enums/genre.enum";
import { StreamingLink } from "./streaming-link.model";

export const Track = z.object({
	id: z.string(),
	title: z.string(),
	artist: z.string(),
	album: z.string().nullable(),
	isrc: z.string().nullable(),
	genre: z.nativeEnum(Genre).optional().nullable(),
	bpm: z.number().int().optional().nullable(),
	duration: z.number(),
	streamingRefs: z.array(StreamingLink).default([]),
	coverUrl: z.string().optional().nullable(),
	previewUrl: z.string().optional().nullable(),
});

export type TrackModel = z.infer<typeof Track>;
