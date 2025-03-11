import { z } from "zod";

export const StreamingLink = z.object({
	platform: z.string(),
	url: z.string(),
});

export type StreamingLinkModel = z.infer<typeof StreamingLink>;
