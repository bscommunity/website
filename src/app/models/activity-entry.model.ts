import { z } from "zod";
import { ActivityType } from "./enums/activity-type.enum";

export const ActivityEntry = z.object({
	id: z.string(),
	type: z.nativeEnum(ActivityType),
	targetId: z.string(),
	createdAt: z.coerce.date(),
});

export type ActivityEntryModel = z.infer<typeof ActivityEntry>;
