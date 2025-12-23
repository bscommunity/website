import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

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

	groupedCharts = signal<HistoryItem[] | undefined | null>([]);
	// groupedTourPasses = signal<HistoryItem[] | undefined | null>(undefined);
	// groupedThemes = signal<HistoryItem[] | undefined | null>(undefined);

	mobileTabs = MOBILE_TABS;
	desktopTabs = DESKTOP_TABS;

	currentTab = MOBILE_TABS[0].value;
	currentDesktopTab = DESKTOP_TABS[0].value;

	convertDateTimeToHumanReadable = convertDateTimeToHumanReadable;

	themes: HistoryItem[] = [];

	ngOnInit(): void {
		// Fetch user data based on username
		this.userService.getUserByUsername(this.username).subscribe({
			next: (data) => {
				console.log("Fetched user data:", data);
				this.profile.set(data);
				this.groupedCharts.set(
					data.charts.reduce((acc, chart) => {
						let group = acc.find(
							(g) =>
								g.date.toDateString() ===
								chart.latestPublishedAt,
						);
						if (!group) {
							group = {
								date: new Date(chart.latestPublishedAt || 0),
								data: [],
							};
							acc.push(group);
						}
						group.data.push(chart);
						return acc;
					}, [] as HistoryItem[]),
				);
			},
			error: (err) => {
				this.profile.set(null);
				console.error("Error fetching user data:", err);
			},
		});
	}
}
