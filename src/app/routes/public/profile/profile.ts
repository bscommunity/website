import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTabsModule } from "@angular/material/tabs";

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

// Lib
import { SAMPLE_CHART_1 } from "@/lib/fake";
import { convertDateTimeToHumanReadable } from "@/lib/time";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

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

const charts: HistoryItem[] = [
	{
		data: [SAMPLE_CHART_1, SAMPLE_CHART_1],
		date: new Date("2024-06-01"),
	},
	{
		data: [SAMPLE_CHART_1],
		date: new Date("2024-06-01"),
	},
];
const tourPasses: HistoryItem[] = [
	{
		data: [SAMPLE_CHART_1, SAMPLE_CHART_1],
		date: new Date("2024-06-01"),
	},
];

const DESKTOP_TABS: Tab<HistoryItem>[] = [
	{
		label: "Charts",
		value: "charts",
		icon: "music_note",
		showLabel: true,
		items: charts,
	},
	{
		label: "Tour Passes",
		value: "tour_passes",
		icon: "music_video",
		showLabel: true,
		items: tourPasses,
		// disabled: true,
	},
	{
		label: "Themes",
		value: "themes",
		icon: "palette",
		showLabel: true,
		items: [],
		// disabled: true,
	},
];

@Component({
	selector: "app-profile",
	imports: [
		MatIconModule,
		MatButtonModule,
		MatRippleModule,
		MatTabsModule,
		RouterLink,
		TabContentWrapperComponent,
		BadgeComponent,
		TabNavBarComponent,
		UserHistoryComponent,
		ChartPreviewComponent,
	],
	templateUrl: "./profile.html",
})
export class Profile {
	route: ActivatedRoute = inject(ActivatedRoute);
	username: string = this.route.snapshot.params["username"];

	mobileTabs = MOBILE_TABS;
	desktopTabs = DESKTOP_TABS;

	currentTab = MOBILE_TABS[0].value;
	currentDesktopTab = DESKTOP_TABS[0].value;

	convertDateTimeToHumanReadable = convertDateTimeToHumanReadable;

	themes: HistoryItem[] = [];
}
