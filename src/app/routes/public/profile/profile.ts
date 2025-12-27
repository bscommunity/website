import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";

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

// Lib
import { convertDateTimeToHumanReadable } from "@/lib/time";

// Models & Services
import { ChartModel } from "@/models/chart.model";
import { UserProfileResponseModel } from "@/models/user.model";
import { UserService } from "@/services/api/user.service";

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
		NgTemplateOutlet,
		RouterLink,
		TabContentWrapperComponent,
		BadgeComponent,
		TabNavBarComponent,
		UserHistoryComponent,
		ChartPreviewComponent,
	],
	templateUrl: "./profile.html",
})
export class Profile implements OnInit {
	private readonly userService = inject(UserService);

	route: ActivatedRoute = inject(ActivatedRoute);
	username: string = this.route.snapshot.params["username"];
	profile = signal<UserProfileResponseModel | undefined | null>(undefined);

	groupedCharts = signal<HistoryItem[] | undefined | null>(undefined);
	userActivity = signal<HistoryItem[] | undefined | null>(undefined);
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
		// Fetch user data based on username
		this.userService.getUserByUsername(this.username).subscribe({
			next: (data) => {
				this.profile.set(data);
				this.groupedCharts.set(this.groupChartsByDate(data.charts));
				this.userActivity.set(this.buildActivityTimeline(data));
			},
			error: (err) => {
				this.profile.set(null);
				this.groupedCharts.set(null);
				this.userActivity.set(null);
				console.error("Error fetching user data:", err);
			},
		});
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
		return (
			this.normalizeDate(chart.latestPublishedAt) ??
			this.normalizeDate(chart.latestVersion?.publishedAt)
		);
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

	private buildActivityTimeline(
		profile: UserProfileResponseModel,
	): HistoryItem[] {
		const groups = new Map<
			string,
			HistoryItem & { action: "liked" | "bookmarked" }
		>();

		const addChartsToGroups = (
			charts: ChartModel[] | undefined,
			action: "liked" | "bookmarked",
		) => {
			charts?.forEach((chart) => {
				const date = this.getChartDate(chart);
				if (!date) {
					return;
				}
				const key = `${action}-${this.buildDateKey(date)}`;
				const existing = groups.get(key);
				if (existing) {
					if (date.getTime() > existing.date.getTime()) {
						existing.date = date;
					}
					existing.data.push(chart);
					return;
				}
				groups.set(key, {
					date,
					data: [chart],
					action,
					label: "",
				});
			});
		};

		addChartsToGroups(profile.likes, "liked");
		addChartsToGroups(profile.bookmarks, "bookmarked");

		return Array.from(groups.values())
			.map((group) => {
				const countLabel = group.data.length === 1 ? "chart" : "charts";
				return {
					date: group.date,
					data: group.data,
					label: `@${profile.user.username} ${group.action} ${group.data.length} ${countLabel}`,
				};
			})
			.sort((a, b) => b.date.getTime() - a.date.getTime());
	}
}
