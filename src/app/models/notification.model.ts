import { z } from "zod";
import { SimplifiedUser } from "./user.model";

export const Notification = z.object({
	id: z.number(),
	type: z.literal("CONTRIBUTOR_ADDED"),
	actor: SimplifiedUser,
	catalogItemId: z.string().nullable(),
	message: z.string(),
	createdAt: z.string(),
});

export type NotificationModel = z.infer<typeof Notification>;

export interface NotificationsResponse {
	items: NotificationModel[];
	unreadCount: number;
}

export interface UnreadCountResponse {
	unreadCount: number;
}

export interface DeleteAllResponse {
	deleted: number;
}
