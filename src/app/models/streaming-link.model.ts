import { z } from "zod";
import { StreamingPlatform } from "./enums/streaming-platform.model";

export const StreamingLink = z.object({
	platform: z.nativeEnum(StreamingPlatform),
	url: z.string(),
});

export type StreamingLinkModel = z.infer<typeof StreamingLink>;
