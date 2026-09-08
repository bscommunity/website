import { z } from "zod";
import { SimplifiedUser } from "./user.model";

export const ContributorAddedMessage = z.object({
	type: z.literal("contributor_added"),
	actorName: z.string(),
	itemType: z.string(),
	itemName: z.string(),
});

export const NotificationMessageSchema = z.discriminatedUnion("type", [
	ContributorAddedMessage,
]);

export interface ContributorAddedMessage {
	type: "contributor_added";
	actorName: string;
	itemType: string;
	itemName: string;
}

export type NotificationMessage = ContributorAddedMessage;

export const Notification = z.object({
	id: z.number(),
	type: z.literal("CONTRIBUTOR_ADDED"),
	actor: SimplifiedUser,
	catalogItemId: z.string().nullable(),
	message: NotificationMessageSchema,
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
