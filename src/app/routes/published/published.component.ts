import { ChangeDetectorRef, Component, OnInit } from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import {
	CustomSelectComponent,
	type Option,
} from "@/components/custom-select/custom-select.component";
import { ChartPreviewComponent } from "../../components/chart-preview/chart-preview.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { FilterPanelComponent } from "./subcomponents/filter-panel/filter-panel.component";
import { ListSectionComponent } from "./subcomponents/list-section.component";
import { LargePanelComponent } from "@/components/panel/large-panel.component";

// Enums
import { Genre } from "@/models/enums/genre.enum";
import { Difficulty } from "@/models/enums/difficulty.enum";

// Models
import { ChartModel } from "@/models/chart.model";
import { VersionModel } from "@/models/version.model";

// Services
import { ChartService } from "@/services/api/chart.service";

// Utils
import { convertStringToMonth } from "@/lib/time";

type ChartWithLatestVersion = ChartModel & {
	latestVersion?: VersionModel;
};

type ChartsByMonth = {
	name: string; // e.g., "2023-10"
	charts: ChartWithLatestVersion[];
};

@Component({
	selector: "app-published",
	imports: [
		MatIconModule,
		MatButtonModule,
		CustomSelectComponent,
		FilterPanelComponent,
		ListSectionComponent,
		ChartPreviewComponent,
		MatProgressSpinnerModule,
		SearchbarComponent,
		LargePanelComponent,
		ChartPreviewComponent,
	],
	templateUrl: "./published.component.html",
})
export class PublishedComponent implements OnInit {
	constructor(
		private chartService: ChartService,
		private cdr: ChangeDetectorRef,
	) {}

	convertStringToMonth = convertStringToMonth;

	sortOptions: Option[] = [
		{
			label: "Newest",
			value: "newest",
		},
		{
			label: "Oldest",
			value: "oldest",
		},
		{
			label: "Most Popular",
			value: "most-popular",
		},
		{
			label: "Least Popular",
			value: "least-popular",
		},
	];

	sortBy: Option = this.sortOptions[0];

	filters = [];

	set charts(value: ChartModel[] | undefined) {
		const charts =
			value?.map((chart) => {
				return {
					...chart,
					latestVersion: chart.versions?.[0] || undefined,
				};
			}) || [];

		this.availableDifficulties = Array.from(
			new Set(charts.map((chart) => Difficulty[chart.difficulty])),
		);

		this.availableGenres = Array.from(
			new Set(
				charts.map((chart) =>
					!!chart.genre ? Genre[chart.genre] : undefined,
				),
			),
		);

		this.availableVersions = Array.from(
			new Set(
				charts
					.map((chart) => (chart.isDeluxe ? "Deluxe" : "Default"))
					.flat(),
			),
		);

		/* console.log(
			"Processed: ",
			this.availableDifficulties,
			this.availableGenres,
			this.availableVersions,
		); */

		const chartsByMonth: ChartsByMonth[] = [];
		charts.forEach((chart) => {
			const month = chart.latestVersion?.publishedAt
				? new Date(chart.latestVersion.publishedAt)
						.toISOString()
						.slice(0, 7)
				: "unknown";

			let monthEntry = chartsByMonth.find(
				(entry) => entry.name === month,
			);
			if (!monthEntry) {
				monthEntry = { name: month, charts: [] };
				chartsByMonth.push(monthEntry);
			}
			monthEntry.charts.push(chart);
		});

		// console.log("Charts grouped by month:", chartsByMonth);

		this._charts = chartsByMonth.sort((a, b) => {
			return new Date(b.name).getTime() - new Date(a.name).getTime();
		});
	}

	get charts(): ChartsByMonth[] | undefined {
		return this._charts;
	}

	private _charts!: ChartsByMonth[] | undefined;

	availableDifficulties: Difficulty[] = [];
	availableGenres: (Genre | undefined)[] = [];
	availableVersions: string[] = [];
	startDate: string | null = null;
	endDate: string | null = null;

	isRefreshing: boolean = true;
	error: string | undefined = undefined;

	ngOnInit(): void {
		// Access resolved data
		this.fetchCharts();
	}

	clearFilters() {
		// Clear filters
	}

	fetchCharts(forceRefresh: boolean = false) {
		this.isRefreshing = forceRefresh;
		this.error = undefined;
		this.chartService.getAllCharts(forceRefresh).subscribe({
			next: (response) => {
				console.log("Resolved charts data:", response);

				this.isRefreshing = false;
				this.charts = response;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error("Error fetching charts:", error);
				this.error = error.message;

				this.isRefreshing = false;
				this.cdr.markForCheck();
			},
		});
	}

	onSearch(query: string) {
		console.log("Search query:", query);
		console.log("Charts before search:", this.charts);

		// Handle search query
	}
}
