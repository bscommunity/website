import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
	OnDestroy,
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
import type { NotificationModel } from "@/models/notification.model";

// Services
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/api/user.service";
import { PublishDialogService } from "@/services/publish/publish.service";
import { ChartPublishHandler } from "@/services/publish/handlers/chart-publish.handler";
import { TourPassPublishHandler } from "@/services/publish/handlers/tourpass-publish.handler";
import { ThemePublishHandler } from "@/services/publish/handlers/theme-publish.handler";
import { convertDateTimeToHumanReadable } from "@/lib/time";
import { Subject, interval } from "rxjs";
import { takeUntil, switchMap } from "rxjs/operators";

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
export class HeaderComponent implements OnInit, OnDestroy {
	private authService = inject(AuthService);
	private userService = inject(UserService);
	private chartPublishHandler = inject(ChartPublishHandler);
	private tourPassPublishHandler = inject(TourPassPublishHandler);
	private themePublishHandler = inject(ThemePublishHandler);

	private _snackBar = inject(MatSnackBar);
	private uploadDialog = inject(PublishDialogService);

	private destroy$ = new Subject<void>();

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

		// Poll for unread count every 30 seconds
		interval(30000)
			.pipe(
				takeUntil(this.destroy$),
				switchMap(() => this.userService.getUnreadNotificationCount()),
			)
			.subscribe({
				next: (res) => {
					this.unreadCount = res.unreadCount;
				},
				error: () => {},
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadNotifications() {
		this.userService.getNotifications({ limit: 20 }).subscribe({
			next: (res) => {
				this.notifications = res.items;
				this.unreadCount = res.unreadCount;
			},
			error: () => {},
		});
	}

	deleteNotification(id: number, event: Event) {
		event.stopPropagation();
		this.userService.deleteNotification(id).subscribe({
			next: () => {
				this.notifications = this.notifications.filter((n) => n.id !== id);
				this.unreadCount = Math.max(0, this.unreadCount - 1);
			},
			error: () => {},
		});
	}

	markAllAsRead() {
		this.userService.markAllNotificationsRead().subscribe({
			next: () => {
				this.notifications = [];
				this.unreadCount = 0;
			},
			error: () => {},
		});
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

	openUploadDialog() {
		this.uploadDialog.open();
	}

	onLogoutButtonClick() {
		this.authService.logout();
	}
}
