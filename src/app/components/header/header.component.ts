import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	OnInit,
} from "@angular/core";

import { RouterLink, RouterLinkActive } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";

// Icons
import { NgIcon, NgGlyph } from "@ng-icons/core";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatRippleModule } from "@angular/material/core";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Types
import type { UserModel } from "@/models/user.model";
import type {
	NotificationModel,
	NotificationMessage,
} from "@/models/notification.model";

// Services
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/api/user.service";
import { PublishDialogService } from "@/services/publish/publish.service";
import { ChartPublishHandler } from "@/services/publish/handlers/chart-publish.handler";
import { TourPassPublishHandler } from "@/services/publish/handlers/tourpass-publish.handler";
import { ThemePublishHandler } from "@/services/publish/handlers/theme-publish.handler";
import { convertDateTimeToHumanReadable } from "@/lib/time";

const NOTIFICATION_MESSAGES: {
	[K in NotificationMessage["type"]]: (
		msg: Extract<NotificationMessage, { type: K }>,
	) => string;
} = {
	contributor_added: (m) =>
		`${m.actorName} shared a ${m.itemType.toLowerCase().replace(/_/g, " ")} (${m.itemName}) with you`,
};

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	imports: [
		NgIcon,
		NgGlyph,
		MatMenuModule,
		MatButtonModule,
		MatRippleModule,
		RouterLink,
		RouterLinkActive,
		AvatarComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
	private authService = inject(AuthService);
	private userService = inject(UserService);
	private chartPublishHandler = inject(ChartPublishHandler);
	private tourPassPublishHandler = inject(TourPassPublishHandler);
	private themePublishHandler = inject(ThemePublishHandler);

	private _snackBar = inject(MatSnackBar);
	private uploadDialog = inject(PublishDialogService);
	private cdr = inject(ChangeDetectorRef);

	user: UserModel | null = null;
	notifications: NotificationModel[] = [];
	unreadCount = 0;

	convertDateTimeToHumanReadable = convertDateTimeToHumanReadable;

	ngOnInit(): void {
		this.user = this.authService.user;

		this.uploadDialog.setHandlers(
			{
				Chart: this.chartPublishHandler,
				Tourpass: this.tourPassPublishHandler,
				Theme: this.themePublishHandler,
			},
			"Chart",
		);

		this.loadNotifications();
	}

	loadNotifications() {
		this.userService.getNotifications({ limit: 20 }).subscribe({
			next: (res) => {
				this.notifications = res.items;
				this.unreadCount = res.unreadCount;
				this.cdr.markForCheck();
			},
			error: () => {},
		});
	}

	deleteNotification(id: number, event: Event) {
		event.stopPropagation();
		this.userService.deleteNotification(id).subscribe({
			next: () => {
				this.notifications = this.notifications.filter(
					(n) => n.id !== id,
				);
				this.unreadCount = Math.max(0, this.unreadCount - 1);
				this.cdr.markForCheck();
			},
			error: () => {},
		});
	}

	markAllAsRead() {
		this.userService.markAllNotificationsRead().subscribe({
			next: () => {
				this.notifications = [];
				this.unreadCount = 0;
				this.cdr.markForCheck();
			},
			error: () => {},
		});
	}

	renderNotificationMessage(
		message: NotificationMessage | string | null | undefined,
	): string {
		if (!message) return "";
		if (typeof message === "string") {
			const raw = message;
			try {
				message = JSON.parse(raw) as NotificationMessage;
			} catch {
				return raw;
			}
		}

		const type = (message as { type?: unknown }).type;
		if (typeof type !== "string") return "You have a new notification";

		const handler = (
			NOTIFICATION_MESSAGES as Record<string, ((msg: never) => string) | undefined>
		)[type];
		if (!handler) return "You have a new notification";

		try {
			return handler(message as never);
		} catch {
			return "You have a new notification";
		}
	}

	openWarning() {
		this._snackBar.open(
			"This feature has not been implemented yet!",
			"Ok",
			{
				horizontalPosition: "right",
				verticalPosition: "bottom",
			},
		);
	}

	/* openProfile() {
		this._snackBar.open("Profile page is not implemented yet!", "Ok", {
			horizontalPosition: "right",
			verticalPosition: "bottom",
		});
	} */

	/* redirectFromNotification(notification: NotificationModel) {
		if (notification.catalogItemId) {
			switch (notification.type) {
				case "CONTRIBUTOR_ADDED":
					window.location.href = `/chart/${notification.catalogItemId}`;
					break;
				default:
					window.location.href = `/${notification.type}/${notification.catalogItemId}`;
					break;
			}
		}
	} */

	openUploadDialog() {
		this.uploadDialog.open();
	}

	onLogoutButtonClick() {
		this.authService.logout();
	}
}
