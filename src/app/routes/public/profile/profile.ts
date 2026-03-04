import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";
import { catchError, finalize, forkJoin, of, switchMap } from "rxjs";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import {
	MatPaginatorIntl,
	MatPaginatorModule,
	PageEvent,
} from "@angular/material/paginator";

// Components
import { TabContentWrapperComponent } from "@/components/tabs/tab-content-wrapper.component";
import { BadgeComponent } from "@/components/badge/badge.component";
import {
	type Tab,
	TabNavBarComponent,
} from "@/components/tabs/tab-nav-bar.component";
import {
	HistoryItem,
	UserHistoryComponent,
} from "@/components/history/history.component";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";
import { ChartDialogComponent } from "@/components/dialogs/chart/chart-dialog.component";

// Lib
import { convertDateTimeToHumanReadable } from "@/lib/time";

// Models & Services
import { ChartModel } from "@/models/chart.model";
import {
	ChartActivityItem,
	UserProfileResponseModel,
} from "@/models/user.model";
import { UserService } from "@/services/api/user.service";
import { PaginatorIntl } from "@/components/paginator/paginator-intl";
import { AuthService } from "@/services/auth.service";
import { ProfileCacheService } from "@/services/profile-cache.service";

const MOBILE_TABS: Tab<HistoryItem>[] = [
	{
		label: "History",
		value: "history",
		icon: "bar_chart",
	},
	{
		label: "Charts",
		value: "charts",
		icon: "library_music",
	},
];

const DESKTOP_TABS: Tab<HistoryItem>[] = [
	{
		label: "Charts",
		value: "charts",
		icon: "music_note",
		showLabel: true,
	},
	{
		label: "Tour Passes",
		value: "tour_passes",
		icon: "music_video",
		showLabel: true,
		disabled: true,
	},
	{
		label: "Themes",
		value: "themes",
		icon: "palette",
		showLabel: true,
		items: [],
		disabled: true,
	},
];

@Component({
	selector: "app-profile",
	imports: [
		MatIconModule,
		MatButtonModule,
		MatRippleModule,
		MatTabsModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatPaginatorModule,
		NgTemplateOutlet,
		RouterLink,
		TabContentWrapperComponent,
		BadgeComponent,
		TabNavBarComponent,
		UserHistoryComponent,
		ChartPreviewComponent,
	],
	providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntl }],
	styles: [
		`
			.mobile-tab-collapse {
				display: grid;
				grid-template-rows: 0fr;
				transition: grid-template-rows 220ms ease;
				overflow: hidden;
			}

			.mobile-tab-collapse.open {
				grid-template-rows: 1fr;
			}

			.mobile-tab-collapse-inner {
				min-height: 0;
			}
		`,
	],
	templateUrl: "./profile.html",
})
export class Profile implements OnInit {
	private readonly userService = inject(UserService);
	private readonly authService = inject(AuthService);
	private readonly _snackBar = inject(MatSnackBar);
	private readonly dialog = inject(MatDialog);
	private readonly profileCacheService = inject(ProfileCacheService);

	route: ActivatedRoute = inject(ActivatedRoute);
	username: string = this.route.snapshot.params["username"];
	profile = signal<UserProfileResponseModel | undefined | null>(undefined);

	groupedCharts = signal<HistoryItem[] | undefined | null>(undefined);
	userActivity = signal<HistoryItem[] | undefined | null>(undefined);
	isChartsLoading = signal(false);
	isFollowLoading = signal(false);
	isFollowing = signal(false);
	isOwnProfile = signal(false);

	totalCharts = signal(0);
	chartsPageSize = 20;
	currentChartsPage = signal(0);

	private readonly chartsCache = new Map<number, ChartModel[]>();
	// groupedTourPasses = signal<HistoryItem[] | undefined | null>(undefined);
	// groupedThemes = signal<HistoryItem[] | undefined | null>(undefined);

	mobileTabs = MOBILE_TABS;
	desktopTabs = DESKTOP_TABS;

	currentTab = MOBILE_TABS[0].value;
	currentDesktopTab = DESKTOP_TABS[0].value;

	convertDateTimeToHumanReadable = convertDateTimeToHumanReadable;

	formatGroupDate(date: Date): string {
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			return "Unknown date";
		}
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	}

	themes: HistoryItem[] = [];

	ngOnInit(): void {
		this.isChartsLoading.set(true);

		// Check for cached profile data
		const cachedProfile = this.profileCacheService.getProfile(
			this.username,
		);
		if (cachedProfile) {
			this.profile.set(cachedProfile.profile);
			this.isFollowing.set(cachedProfile.isFollowing);
			this.isOwnProfile.set(cachedProfile.isOwnProfile);

			// Load cached charts for page 0
			const cachedCharts = this.profileCacheService.getCharts(
				this.username,
				0,
			);
			if (cachedCharts) {
				this.chartsCache.set(0, cachedCharts.charts);
				this.totalCharts.set(cachedCharts.total);
				this.applyChartGroups(cachedCharts.charts);
			}

			// Load cached activity
			const cachedActivity = this.profileCacheService.getActivity(
				this.username,
			);
			if (cachedActivity) {
				this.userActivity.set(cachedActivity);
			}

			this.isChartsLoading.set(false);
			return;
		}

		// Fetch from API if not cached or cache invalid
		this.userService
			.getUserByUsername(this.username)
			.pipe(
				switchMap((profile) => {
					this.profile.set(profile);
					this.isFollowing.set(Boolean(profile.isFollowing));
					this.isOwnProfile.set(
						this.getAuthenticatedUserId() === profile.user.id,
					);
					this.currentChartsPage.set(0);
					this.chartsCache.clear();

					// Cache the profile data
					this.profileCacheService.setProfile(this.username, {
						profile,
						isFollowing: Boolean(profile.isFollowing),
						isOwnProfile:
							this.getAuthenticatedUserId() === profile.user.id,
					});

					return forkJoin({
						chartsPage: this.userService.getUserCharts(
							profile.user.id,
							{
								limit: 20,
								offset: 0,
							},
						),
						activity: this.userService
							.getUserActivity(profile.user.id, {
								limit: 20,
								offset: 0,
							})
							.pipe(catchError(() => of([]))),
					});
				}),
			)
			.subscribe({
				next: ({ chartsPage, activity }) => {
					const initialCharts = chartsPage.items ?? [];
					this.chartsCache.set(0, initialCharts);
					this.totalCharts.set(
						chartsPage.counts?.charts ?? initialCharts.length,
					);
					this.applyChartGroups(initialCharts);

					// Cache charts
					this.profileCacheService.setCharts(this.username, 0, {
						charts: initialCharts,
						total: this.totalCharts(),
					});

					const profile = this.profile();
					const activityTimeline = this.buildActivityTimelineFromApi(
						activity,
						profile?.user.username ?? this.username,
					);
					this.userActivity.set(activityTimeline);

					// Cache activity
					this.profileCacheService.setActivity(
						this.username,
						activityTimeline,
					);

					this.isChartsLoading.set(false);
				},
				error: (err) => {
					this.profile.set(null);
					this.groupedCharts.set(null);
					this.userActivity.set(null);
					this.isChartsLoading.set(false);
					this.totalCharts.set(0);
					this.currentChartsPage.set(0);
					this.isFollowing.set(false);
					this.isOwnProfile.set(false);
					console.error("Error fetching user data:", err);
				},
			});
	}

	get isOwner(): boolean {
		return this.authService.isLoggedIn() && this.isOwnProfile();
	}

	onFollowClick(): void {
		const profile = this.profile();
		if (!profile || !this.isOwner || this.isFollowLoading()) {
			return;
		}

		this.isFollowLoading.set(true);
		const request$ = this.isFollowing()
			? this.userService.unfollowUser(profile.user.id)
			: this.userService.followUser(profile.user.id);

		request$
			.pipe(finalize(() => this.isFollowLoading.set(false)))
			.subscribe({
				next: () => {
					const wasFollowing = this.isFollowing();
					this.isFollowing.set(!wasFollowing);
					this._snackBar.open(
						wasFollowing
							? `You unfollowed @${profile.user.username}`
							: `You are now following @${profile.user.username}`,
						"Close",
						{ duration: 3500 },
					);

					// Update cached profile data
					this.profileCacheService.setProfile(this.username, {
						profile,
						isFollowing: this.isFollowing(),
						isOwnProfile: this.isOwnProfile(),
					});
				},
				error: (error) => {
					console.error("Failed to toggle follow state:", error);
					this._snackBar.open(
						"Could not update follow status. Please try again.",
						"Close",
						{ duration: 4000 },
					);
				},
			});
	}

	onChartsPageChange(event: PageEvent): void {
		const pageIndex = event.pageIndex;
		this.currentChartsPage.set(pageIndex);

		const cached = this.chartsCache.get(pageIndex);
		if (cached) {
			this.applyChartGroups(cached);
			return;
		}

		// Check sessionStorage cache
		const sessionCached = this.profileCacheService.getCharts(
			this.username,
			pageIndex,
		);
		if (sessionCached) {
			this.chartsCache.set(pageIndex, sessionCached.charts);
			this.applyChartGroups(sessionCached.charts);
			return;
		}

		const profile = this.profile();
		if (!profile) {
			return;
		}

		this.isChartsLoading.set(true);
		this.userService
			.getUserCharts(profile.user.id, {
				limit: this.chartsPageSize,
				offset: pageIndex * this.chartsPageSize,
			})
			.subscribe({
				next: (chartsPage) => {
					const charts = chartsPage.items ?? [];
					this.chartsCache.set(pageIndex, charts);
					if (pageIndex === 0) {
						this.totalCharts.set(
							chartsPage.counts?.charts ?? charts.length,
						);
					}
					this.applyChartGroups(charts);

					// Cache in sessionStorage
					this.profileCacheService.setCharts(
						this.username,
						pageIndex,
						{
							charts,
							total: this.totalCharts(),
						},
					);

					this.isChartsLoading.set(false);
				},
				error: () => {
					this.groupedCharts.set(null);
					this.isChartsLoading.set(false);
				},
			});
	}

	openChartDialog(chart: ChartModel): void {
		this.dialog.open(ChartDialogComponent, {
			data: { chart },
			width: "575px",
			maxHeight: "85vh",
		});
	}

	onShare() {
		// Generate shareable link
		const url = `${window.location.origin}/link/profile/${this.profile()?.user.username}`;

		// Copy to clipboard
		navigator.clipboard.writeText(url);

		// Show snackbar
		this._snackBar.open("Profile link copied to clipboard!", "Close", {
			duration: 1000,
		});
	}

	get totalChartPages(): number {
		const total = this.totalCharts();
		return total > 0 ? Math.ceil(total / this.chartsPageSize) : 0;
	}

	private applyChartGroups(charts: ChartModel[]): void {
		const groupedCharts = this.groupChartsByDate(charts);
		this.groupedCharts.set(groupedCharts);
		this.desktopTabs[0] = {
			...this.desktopTabs[0],
			items: groupedCharts,
		};
	}

	private getAuthenticatedUserId(): string | null {
		if (!this.authService.isLoggedIn()) {
			return null;
		}

		try {
			return this.authService.user.id;
		} catch {
			return null;
		}
	}

	private normalizeDate(value?: string | Date | null): Date | null {
		if (!value) {
			return null;
		}
		if (value instanceof Date) {
			return new Date(value);
		}
		const normalized = value.endsWith("Z") ? value : `${value}Z`;
		const parsed = new Date(normalized);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	private getChartDate(chart: ChartModel): Date | null {
		return this.normalizeDate(chart.updatedAt);
	}

	private buildDateKey(date: Date): string {
		return date.toISOString().split("T")[0] ?? date.toISOString();
	}

	private groupChartsByDate(charts: ChartModel[]): HistoryItem[] {
		const groups = charts.reduce((map, chart) => {
			const date = this.getChartDate(chart);
			if (!date) {
				return map;
			}
			const key = this.buildDateKey(date);
			const existing = map.get(key);
			if (existing) {
				if (date.getTime() > existing.date.getTime()) {
					existing.date = date;
				}
				existing.data.push(chart);
				return map;
			}
			map.set(key, { date, data: [chart] });
			return map;
		}, new Map<string, HistoryItem>());

		return Array.from(groups.values()).sort(
			(a, b) => b.date.getTime() - a.date.getTime(),
		);
	}

	private getActivityLabel(type: string, username: string): string {
		const action = type
			.toLowerCase()
			.replace("_chart", "")
			.replace("_", " ");
		return `@${username} ${action} a chart`;
	}

	private buildActivityTimelineFromApi(
		activity: ChartActivityItem[],
		username: string,
	): HistoryItem[] {
		const groups = new Map<
			string,
			{ date: Date; data: ChartModel[]; labels: string[] }
		>();

		for (const item of activity) {
			const date = new Date(item.createdAt);
			if (Number.isNaN(date.getTime())) {
				continue;
			}

			const key = this.buildDateKey(date);
			const existing = groups.get(key);
			if (existing) {
				existing.data.push(item.chart);
				existing.labels.push(
					this.getActivityLabel(item.type, username),
				);
			} else {
				groups.set(key, {
					date,
					data: [item.chart],
					labels: [this.getActivityLabel(item.type, username)],
				});
			}
		}

		const timeline: HistoryItem[] = [];
		for (const group of groups.values()) {
			timeline.push({
				date: group.date,
				data: group.data,
				label:
					group.labels.length === 1
						? group.labels[0]
						: `${group.labels.length} activities`,
			});
		}

		return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
	}
}
