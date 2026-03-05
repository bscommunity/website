import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";
import { catchError, finalize, forkJoin, of, switchMap } from "rxjs";
import { Observable, Subscription } from "rxjs";

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
	type HistoryActivityEntry,
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
	ActivityType,
	ItemsPageModel,
	type SimplifiedUserModel,
	UserActivityItem,
	UserProfileResponseModel,
} from "@/models/user.model";
import { UserService } from "@/services/api/user.service";
import { PaginatorIntl } from "@/components/paginator/paginator-intl";
import { ShareService } from "@/services/share.service";
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

const DESKTOP_TABS_BASE: Omit<Tab<HistoryItem>, "label">[] = [
	{
		value: "charts",
		icon: "music_note",
		showLabel: true,
	},
	{
		value: "tour_passes",
		icon: "music_video",
		showLabel: true,
		disabled: true,
	},
	{
		value: "themes",
		icon: "palette",
		showLabel: true,
		items: [],
		disabled: true,
	},
];

type ProfileContentType = "charts" | "likes" | "bookmarks";

interface OwnerInitialLoadResult {
	likesPage: ItemsPageModel<ChartModel>;
	bookmarksPage: ItemsPageModel<ChartModel>;
	activity: UserActivityItem[];
}

interface PublicInitialLoadResult {
	chartsPage: ItemsPageModel<ChartModel>;
	activity: UserActivityItem[];
}

interface OwnerCollectionPageConfig {
	type: "likes" | "bookmarks";
	pageIndex: number;
	pageSize: number;
	cacheMap: Map<number, ChartModel[]>;
	cacheGetter: (
		username: string,
		page: number,
	) => {
		charts: ChartModel[];
		total: number;
		counts?: ItemsPageModel<ChartModel>["counts"];
	} | null;
	cacheSetter: (
		username: string,
		page: number,
		data: {
			charts: ChartModel[];
			total: number;
			counts?: ItemsPageModel<ChartModel>["counts"];
		},
	) => void;
	request: (params: {
		limit?: number;
		offset?: number;
	}) => ReturnType<UserService["getMyLikes"]>;
	setLoading: (isLoading: boolean) => void;
	setTotal: (value: number) => void;
	setErrorState: () => void;
}

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

			.active {
				font-weight: 600;
			}
		`,
	],
	templateUrl: "./profile.html",
})
export class Profile implements OnInit, OnDestroy {
	private readonly userService = inject(UserService);
	private readonly authService = inject(AuthService);
	private readonly _snackBar = inject(MatSnackBar);
	private readonly dialog = inject(MatDialog);
	private readonly profileCacheService = inject(ProfileCacheService);
	private readonly shareService = inject(ShareService);

	route: ActivatedRoute = inject(ActivatedRoute);
	username = "";
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

	totalTourPasses = signal(0);
	totalThemes = signal(0);

	groupedLikes = signal<HistoryItem[] | undefined | null>(undefined);
	isLikesLoading = signal(false);
	totalLikes = signal(0);
	likesPageSize = 20;
	currentLikesPage = signal(0);

	groupedBookmarks = signal<HistoryItem[] | undefined | null>(undefined);
	isBookmarksLoading = signal(false);
	totalBookmarks = signal(0);
	bookmarksPageSize = 20;
	currentBookmarksPage = signal(0);

	private readonly chartsCache = new Map<number, ChartModel[]>();
	private readonly likesCache = new Map<number, ChartModel[]>();
	private readonly bookmarksCache = new Map<number, ChartModel[]>();
	private routeParamSubscription?: Subscription;
	// groupedTourPasses = signal<HistoryItem[] | undefined | null>(undefined);
	// groupedThemes = signal<HistoryItem[] | undefined | null>(undefined);

	mobileTabs = MOBILE_TABS;
	desktopTabs: Tab<HistoryItem>[] = [];

	currentTab = MOBILE_TABS[0].value;
	currentDesktopTab = "";

	currentContentType = signal("charts");

	convertDateTimeToHumanReadable = convertDateTimeToHumanReadable;

	setDesktopTabs(): void {
		if (this.isOwnProfile()) {
			this.desktopTabs = [
				{
					value: "likes",
					icon: "favorite",
					showLabel: true,
					label: `Likes (${this.totalLikes()})`,
					items: this.groupedLikes() || [],
				},
				{
					value: "bookmarks",
					icon: "bookmark",
					showLabel: true,
					label: `Bookmarks (${this.totalBookmarks()})`,
					items: this.groupedBookmarks() || [],
				},
			];
			this.currentDesktopTab = "likes";
		} else {
			this.desktopTabs = DESKTOP_TABS_BASE.map((tab) => ({
				...tab,
				label:
					tab.value === "charts"
						? `Charts (${this.totalCharts()})`
						: tab.value === "tour_passes"
							? `Tour Passes (${this.totalTourPasses()})`
							: `Themes (${this.totalThemes()})`,
			}));
			this.currentDesktopTab = "charts";
		}
	}

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
		this.routeParamSubscription = this.route.paramMap.subscribe(
			(params) => {
				const username = params.get("username")?.trim();
				if (!username || username === this.username) {
					return;
				}

				this.username = username;
				this.scrollToTop();
				this.loadProfile(username);
			},
		);
	}

	ngOnDestroy(): void {
		this.routeParamSubscription?.unsubscribe();
	}

	private loadProfile(username: string): void {
		this.resetProfileState();

		if (this.hydrateFromCache(username)) {
			this.finishInitialLoading();
			return;
		}

		this.fetchProfileFromApi(username);
	}

	private hydrateFromCache(username: string): boolean {
		const cachedProfile = this.profileCacheService.getProfile(username);
		if (!cachedProfile) {
			return false;
		}

		this.profile.set(cachedProfile.profile);
		this.isFollowing.set(cachedProfile.isFollowing);
		this.isOwnProfile.set(cachedProfile.isOwnProfile);

		if (cachedProfile.isOwnProfile) {
			this.hydrateOwnerCollectionsFromCache(username);
		} else {
			this.hydratePublicChartsFromCache(username);
		}

		const cachedActivity = this.profileCacheService.getActivity(username);
		if (cachedActivity) {
			this.userActivity.set(cachedActivity);
		}

		this.setDesktopTabs();
		return true;
	}

	private hydrateOwnerCollectionsFromCache(username: string): void {
		const cachedLikes = this.profileCacheService.getLikes(username, 0);
		if (cachedLikes) {
			this.likesCache.set(0, cachedLikes.charts);
			this.totalLikes.set(cachedLikes.total);
			this.applyChartGroups(cachedLikes.charts, "likes");
		}

		const cachedBookmarks = this.profileCacheService.getBookmarks(
			username,
			0,
		);
		if (cachedBookmarks) {
			this.bookmarksCache.set(0, cachedBookmarks.charts);
			this.totalBookmarks.set(cachedBookmarks.total);
			this.applyChartGroups(cachedBookmarks.charts, "bookmarks");
		}
	}

	private hydratePublicChartsFromCache(username: string): void {
		const cachedCharts = this.profileCacheService.getCharts(username, 0);
		if (!cachedCharts) {
			return;
		}

		this.chartsCache.set(0, cachedCharts.charts);
		this.totalCharts.set(cachedCharts.total);
		this.totalTourPasses.set(cachedCharts.counts?.tourPasses ?? 0);
		this.totalThemes.set(cachedCharts.counts?.themes ?? 0);
		this.applyChartGroups(cachedCharts.charts, "charts");
	}

	private fetchProfileFromApi(username: string): void {
		this.userService
			.getUserByUsername(username)
			.pipe(
				switchMap((profile) => {
					const viewerId = this.getAuthenticatedUserId();
					const isOwnProfile = viewerId === profile.user.id;

					this.profile.set(profile);
					this.isFollowing.set(Boolean(profile.isFollowing));
					this.isOwnProfile.set(isOwnProfile);
					this.currentChartsPage.set(0);
					this.currentLikesPage.set(0);
					this.currentBookmarksPage.set(0);

					this.profileCacheService.setProfile(username, {
						profile,
						isFollowing: Boolean(profile.isFollowing),
						isOwnProfile,
					});

					return isOwnProfile
						? this.loadOwnerData(profile.user.id)
						: this.loadPublicData(profile.user.id);
				}),
			)
			.subscribe({
				next: (result) => {
					if (this.isOwnerLoadResult(result)) {
						this.applyOwnerInitialData(username, result);
					} else {
						this.applyPublicInitialData(username, result);
					}

					this.applyActivityAndCache(username, result.activity);
					this.setDesktopTabs();
					this.finishInitialLoading();
				},
				error: (err) => {
					this.handleProfileLoadError(err);
				},
			});
	}

	private loadOwnerData(userId: string): Observable<OwnerInitialLoadResult> {
		return forkJoin({
			likesPage: this.userService.getMyLikes({
				limit: this.likesPageSize,
				offset: 0,
			}),
			bookmarksPage: this.userService.getMyBookmarks({
				limit: this.bookmarksPageSize,
				offset: 0,
			}),
			activity: this.userService
				.getUserActivity(userId, {
					limit: 20,
					offset: 0,
				})
				.pipe(catchError(() => of([]))),
		});
	}

	private loadPublicData(
		userId: string,
	): Observable<PublicInitialLoadResult> {
		return forkJoin({
			chartsPage: this.userService.getUserCharts(userId, {
				limit: this.chartsPageSize,
				offset: 0,
			}),
			activity: this.userService
				.getUserActivity(userId, {
					limit: 20,
					offset: 0,
				})
				.pipe(catchError(() => of([]))),
		});
	}

	private isOwnerLoadResult(
		result: OwnerInitialLoadResult | PublicInitialLoadResult,
	): result is OwnerInitialLoadResult {
		return "likesPage" in result;
	}

	private applyOwnerInitialData(
		username: string,
		result: OwnerInitialLoadResult,
	): void {
		const likes = this.normalizeCollectionItems(
			result.likesPage.items ?? [],
		);
		this.likesCache.set(0, likes);
		this.totalLikes.set(result.likesPage.counts?.charts ?? likes.length);
		this.applyChartGroups(likes, "likes");

		const bookmarks = this.normalizeCollectionItems(
			result.bookmarksPage.items ?? [],
		);
		this.bookmarksCache.set(0, bookmarks);
		this.totalBookmarks.set(
			result.bookmarksPage.counts?.charts ?? bookmarks.length,
		);
		this.applyChartGroups(bookmarks, "bookmarks");

		this.profileCacheService.setLikes(username, 0, {
			charts: likes,
			total: this.totalLikes(),
			counts: result.likesPage.counts,
		});

		this.profileCacheService.setBookmarks(username, 0, {
			charts: bookmarks,
			total: this.totalBookmarks(),
			counts: result.bookmarksPage.counts,
		});
	}

	private applyPublicInitialData(
		username: string,
		result: PublicInitialLoadResult,
	): void {
		const charts = result.chartsPage.items ?? [];
		this.chartsCache.set(0, charts);
		this.totalCharts.set(result.chartsPage.counts?.charts ?? charts.length);
		this.totalTourPasses.set(result.chartsPage.counts?.tourPasses ?? 0);
		this.totalThemes.set(result.chartsPage.counts?.themes ?? 0);
		this.applyChartGroups(charts, "charts");

		this.profileCacheService.setCharts(username, 0, {
			charts,
			total: this.totalCharts(),
			counts: result.chartsPage.counts,
		});
	}

	private applyActivityAndCache(
		username: string,
		activity: UserActivityItem[],
	): void {
		const profile = this.profile();
		const activityTimeline = this.buildActivityTimelineFromApi(
			activity,
			profile?.user.username ?? username,
		);
		this.userActivity.set(activityTimeline);
		this.profileCacheService.setActivity(username, activityTimeline);
	}

	private finishInitialLoading(): void {
		this.isChartsLoading.set(false);
		this.isLikesLoading.set(false);
		this.isBookmarksLoading.set(false);
	}

	private handleProfileLoadError(err: unknown): void {
		this.profile.set(null);
		this.groupedCharts.set(null);
		this.groupedLikes.set(null);
		this.groupedBookmarks.set(null);
		this.userActivity.set(null);
		this.finishInitialLoading();
		this.totalCharts.set(0);
		this.currentChartsPage.set(0);
		this.totalLikes.set(0);
		this.currentLikesPage.set(0);
		this.totalBookmarks.set(0);
		this.currentBookmarksPage.set(0);
		this.isFollowing.set(false);
		this.isOwnProfile.set(false);
		console.error("Error fetching user data:", err);
	}

	private resetProfileState(): void {
		this.profile.set(undefined);
		this.groupedCharts.set(undefined);
		this.userActivity.set(undefined);
		this.isChartsLoading.set(true);
		this.totalCharts.set(0);
		this.currentChartsPage.set(0);
		this.isFollowing.set(false);
		this.isOwnProfile.set(false);
		this.chartsCache.clear();
		this.totalTourPasses.set(0);
		this.totalThemes.set(0);

		this.groupedLikes.set(undefined);
		this.isLikesLoading.set(true);
		this.totalLikes.set(0);
		this.currentLikesPage.set(0);
		this.likesCache.clear();

		this.groupedBookmarks.set(undefined);
		this.isBookmarksLoading.set(true);
		this.totalBookmarks.set(0);
		this.currentBookmarksPage.set(0);
		this.bookmarksCache.clear();
	}

	private scrollToTop(): void {
		if (typeof window === "undefined") {
			return;
		}

		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}

	get isOwner(): boolean {
		return this.authService.isLoggedIn() && this.isOwnProfile();
	}

	get ownerMobileTabs(): Tab<HistoryItem>[] {
		return this.desktopTabs.map((tab) => ({ ...tab, showLabel: false }));
	}

	onFollowClick(): void {
		const profile = this.profile();
		if (!profile || this.isOwner || this.isFollowLoading()) {
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
			this.applyChartGroups(cached, "charts");
			return;
		}

		// Check sessionStorage cache
		const sessionCached = this.profileCacheService.getCharts(
			this.username,
			pageIndex,
		);
		if (sessionCached) {
			this.chartsCache.set(pageIndex, sessionCached.charts);
			this.totalTourPasses.set(
				sessionCached.counts?.tourPasses ?? this.totalTourPasses(),
			);
			this.totalThemes.set(
				sessionCached.counts?.themes ?? this.totalThemes(),
			);
			this.applyChartGroups(sessionCached.charts, "charts");
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
						this.setDesktopTabs();
					}
					this.totalTourPasses.set(
						chartsPage.counts?.tourPasses ?? this.totalTourPasses(),
					);
					this.totalThemes.set(
						chartsPage.counts?.themes ?? this.totalThemes(),
					);
					this.applyChartGroups(charts, "charts");

					// Cache in sessionStorage
					this.profileCacheService.setCharts(
						this.username,
						pageIndex,
						{
							charts,
							total: this.totalCharts(),
							counts: chartsPage.counts,
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

	onLikesPageChange(event: PageEvent): void {
		const pageIndex = event.pageIndex;
		this.currentLikesPage.set(pageIndex);
		this.loadOwnerCollectionPage({
			type: "likes",
			pageIndex,
			pageSize: this.likesPageSize,
			cacheMap: this.likesCache,
			cacheGetter: (username, page) =>
				this.profileCacheService.getLikes(username, page),
			cacheSetter: (username, page, data) =>
				this.profileCacheService.setLikes(username, page, data),
			request: (params) => this.userService.getMyLikes(params),
			setLoading: (isLoading) => this.isLikesLoading.set(isLoading),
			setTotal: (total) => this.totalLikes.set(total),
			setErrorState: () => this.groupedLikes.set(null),
		});
	}

	onBookmarksPageChange(event: PageEvent): void {
		const pageIndex = event.pageIndex;
		this.currentBookmarksPage.set(pageIndex);
		this.loadOwnerCollectionPage({
			type: "bookmarks",
			pageIndex,
			pageSize: this.bookmarksPageSize,
			cacheMap: this.bookmarksCache,
			cacheGetter: (username, page) =>
				this.profileCacheService.getBookmarks(username, page),
			cacheSetter: (username, page, data) =>
				this.profileCacheService.setBookmarks(username, page, data),
			request: (params) => this.userService.getMyBookmarks(params),
			setLoading: (isLoading) => this.isBookmarksLoading.set(isLoading),
			setTotal: (total) => this.totalBookmarks.set(total),
			setErrorState: () => this.groupedBookmarks.set(null),
		});
	}

	private loadOwnerCollectionPage(config: OwnerCollectionPageConfig): void {
		const cached = config.cacheMap.get(config.pageIndex);
		if (cached) {
			this.applyChartGroups(cached, config.type);
			return;
		}

		const sessionCached = config.cacheGetter(
			this.username,
			config.pageIndex,
		);
		if (sessionCached) {
			const normalizedCached = this.normalizeCollectionItems(
				sessionCached.charts,
			);
			config.cacheMap.set(config.pageIndex, normalizedCached);
			this.applyChartGroups(normalizedCached, config.type);
			return;
		}

		config.setLoading(true);
		config
			.request({
				limit: config.pageSize,
				offset: config.pageIndex * config.pageSize,
			})
			.subscribe({
				next: (page) => {
					const items = this.normalizeCollectionItems(
						page.items ?? [],
					);
					config.cacheMap.set(config.pageIndex, items);
					if (config.pageIndex === 0) {
						config.setTotal(page.counts?.charts ?? items.length);
						this.setDesktopTabs();
					}
					this.applyChartGroups(items, config.type);

					config.cacheSetter(this.username, config.pageIndex, {
						charts: items,
						total:
							config.pageIndex === 0
								? (page.counts?.charts ?? items.length)
								: config.cacheMap.size > 0
									? config.type === "likes"
										? this.totalLikes()
										: this.totalBookmarks()
									: items.length,
						counts: page.counts,
					});

					config.setLoading(false);
				},
				error: () => {
					config.setErrorState();
					config.setLoading(false);
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

	onShare(): void {
		const profile = this.profile();
		if (!profile) {
			return;
		}

		const url = `${window.location.origin}/profile/${profile.user.username}`;
		const title = `${profile.user.username}'s Profile`;
		this.shareService.share(url, title);
	}

	get totalChartPages(): number {
		const total = this.totalCharts();
		return total > 0 ? Math.ceil(total / this.chartsPageSize) : 0;
	}

	get totalLikesPages(): number {
		const total = this.totalLikes();
		return total > 0 ? Math.ceil(total / this.likesPageSize) : 0;
	}

	get totalBookmarksPages(): number {
		const total = this.totalBookmarks();
		return total > 0 ? Math.ceil(total / this.bookmarksPageSize) : 0;
	}

	setContentType(type: string): void {
		this.currentContentType.set(type);
		// Future implementation: filter content based on type
	}

	private applyChartGroups(
		charts: ChartModel[],
		type: ProfileContentType = "charts",
	): void {
		const groupedCharts = this.groupChartsByDate(charts, type);
		if (type === "charts") {
			this.groupedCharts.set(groupedCharts);
			const chartsTabIndex = this.desktopTabs.findIndex(
				(tab) => tab.value === "charts",
			);
			if (chartsTabIndex >= 0) {
				this.desktopTabs[chartsTabIndex] = {
					...this.desktopTabs[chartsTabIndex],
					items: groupedCharts,
				};
			}
		} else if (type === "likes") {
			this.groupedLikes.set(groupedCharts);
			const likesTab = this.desktopTabs.find(
				(tab) => tab.value === "likes",
			);
			if (likesTab) {
				likesTab.items = groupedCharts;
			}
		} else if (type === "bookmarks") {
			this.groupedBookmarks.set(groupedCharts);
			const bookmarksTab = this.desktopTabs.find(
				(tab) => tab.value === "bookmarks",
			);
			if (bookmarksTab) {
				bookmarksTab.items = groupedCharts;
			}
		}
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

	private getCollectionDate(
		chart: ChartModel,
		type: ProfileContentType,
	): Date | null {
		if (type === "likes") {
			return (
				this.normalizeDate(chart.likedAt) ||
				this.normalizeDate(chart.updatedAt) ||
				this.normalizeDate(chart.createdAt)
			);
		}

		if (type === "bookmarks") {
			return (
				this.normalizeDate(chart.bookmarkedAt) ||
				this.normalizeDate(chart.updatedAt) ||
				this.normalizeDate(chart.createdAt)
			);
		}

		return this.getChartDate(chart);
	}

	private buildDateKey(date: Date): string {
		return date.toISOString().split("T")[0] ?? date.toISOString();
	}

	private groupChartsByDate(
		charts: ChartModel[],
		type: ProfileContentType,
	): HistoryItem[] {
		const groups = charts.reduce((map, chart) => {
			const date = this.getCollectionDate(chart, type);
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

	private normalizeCollectionItems(items: unknown[]): ChartModel[] {
		return items
			.map((item) => this.extractChartLikeItem(item))
			.filter((item): item is ChartModel => item !== null);
	}

	private extractChartLikeItem(item: unknown): ChartModel | null {
		if (!this.isRecord(item)) {
			return null;
		}

		const direct = this.isChartLikeRecord(item) ? item : null;
		if (direct) {
			return direct as ChartModel;
		}

		const maybeChart = item["chart"];
		if (this.isChartLikeRecord(maybeChart)) {
			return maybeChart as ChartModel;
		}

		const maybeContent = item["content"];
		if (this.isChartLikeRecord(maybeContent)) {
			return maybeContent as ChartModel;
		}

		return null;
	}

	private isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === "object" && value !== null;
	}

	private isChartLikeRecord(
		value: unknown,
	): value is Record<string, unknown> {
		if (!this.isRecord(value)) {
			return false;
		}

		return (
			typeof value["id"] === "string" &&
			typeof value["contentId"] === "string" &&
			typeof value["coverUrl"] === "string"
		);
	}

	private getActivityTargetUser(
		item: UserActivityItem,
	): SimplifiedUserModel | undefined {
		return item.followedUser ?? item.targetUser ?? item.user ?? undefined;
	}

	private getSummaryPart(type: ActivityType, count: number): string {
		switch (type) {
			case ActivityType.CREATED_CHART:
				return `created ${count} chart${count > 1 ? "s" : ""}`;
			case ActivityType.LIKED_CHART:
				return `liked ${count} chart${count > 1 ? "s" : ""}`;
			case ActivityType.BOOKMARKED_CHART:
				return `bookmarked ${count} chart${count > 1 ? "s" : ""}`;
			case ActivityType.FOLLOWED_USER:
				return `followed ${count} user${count > 1 ? "s" : ""}`;
		}
	}

	private joinSummaryParts(parts: string[]): string {
		if (parts.length === 0) {
			return "had activity";
		}
		if (parts.length === 1) {
			return parts[0];
		}
		if (parts.length === 2) {
			return `${parts[0]} and ${parts[1]}`;
		}
		return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
	}

	private buildActivityTimelineFromApi(
		activity: UserActivityItem[],
		username: string,
	): HistoryItem[] {
		const groups = new Map<
			string,
			{
				date: Date;
				data: ChartModel[];
				types: ActivityType[];
				activities: HistoryActivityEntry[];
			}
		>();

		for (const item of activity) {
			const date = new Date(item.createdAt);
			if (Number.isNaN(date.getTime())) {
				continue;
			}

			const chart = item.chart ?? undefined;
			const user = this.getActivityTargetUser(item);
			const activityType = item.type;
			const historyEntry: HistoryActivityEntry = {
				type: activityType,
				chart,
				user,
			};

			const key = this.buildDateKey(date);
			const existing = groups.get(key);
			if (existing) {
				if (chart) {
					existing.data.push(chart);
				}
				existing.types.push(activityType);
				existing.activities.push(historyEntry);
				if (date.getTime() > existing.date.getTime()) {
					existing.date = date;
				}
				continue;
			}

			groups.set(key, {
				date,
				data: chart ? [chart] : [],
				types: [activityType],
				activities: [historyEntry],
			});
		}

		const timeline: HistoryItem[] = [];
		for (const group of groups.values()) {
			const typeCounts = new Map<ActivityType, number>();
			for (const type of group.types) {
				typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
			}

			const orderedTypes: ActivityType[] = [
				ActivityType.CREATED_CHART,
				ActivityType.LIKED_CHART,
				ActivityType.BOOKMARKED_CHART,
				ActivityType.FOLLOWED_USER,
			];

			const parts = orderedTypes
				.filter((type) => typeCounts.has(type))
				.map((type) =>
					this.getSummaryPart(type, typeCounts.get(type)!),
				);

			const uniqueTypes = Array.from(typeCounts.keys());
			timeline.push({
				date: group.date,
				data: group.data,
				activities: group.activities,
				label: `@${username} ${this.joinSummaryParts(parts)}`,
				actionType:
					uniqueTypes.length === 1 ? uniqueTypes[0] : undefined,
			});
		}

		return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
	}
}
