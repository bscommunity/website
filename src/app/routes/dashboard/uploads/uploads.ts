import { ChangeDetectorRef, Component, OnInit, inject } from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import {
	SelectComponent,
	type Option,
} from "@/components/select/select.component";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { FilterPanelComponent } from "@/components/filter-panel/filter-panel.component";
import { LargePanelComponent } from "@/components/panel/large-panel.component";
import { ListSectionComponent } from "./subcomponents/list-section.component";

// Enums
import { Genre } from "@/models/enums/genre.enum";
import { Difficulty } from "@/models/enums/difficulty.enum";

// Models
import { ChartModel, withLatestVersion } from "@/models/chart.model";

// Services
import { ChartService } from "@/services/api/chart.service";

// Utils
import { convertStringToMonth } from "@/lib/time";

type ChartsByMonth = {
	name: string; // e.g., "2023-10"
	charts: ChartModel[];
};

@Component({
	selector: "app-uploads",
	imports: [
		MatIconModule,
		MatButtonModule,
		SelectComponent,
		FilterPanelComponent,
		ListSectionComponent,
		ChartPreviewComponent,
		MatProgressSpinnerModule,
		SearchbarComponent,
		LargePanelComponent,
		ChartPreviewComponent,
	],
	templateUrl: "./uploads.html",
})
export class Uploads implements OnInit {
	private chartService = inject(ChartService);
	private cdr = inject(ChangeDetectorRef);

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
		const charts: ChartModel[] = value?.map(withLatestVersion) || [];

		this.availableDifficulties = Array.from(
			new Set(
				charts.map(
					(chart) => Difficulty[chart.latestVersion.difficulty],
				),
			),
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
					.map((chart) =>
						chart.latestVersion.isDeluxe ? "Deluxe" : "Default",
					)
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
		this.fetchCharts(false);
	}

	clearFilters() {
		// Clear filters
	}

	fetchCharts(forceRefresh: boolean = false) {
		this.isRefreshing = forceRefresh;
		this.error = undefined;
		// Send isDashboard=true to restrict results to logged-in user content
		this.chartService
			.getCharts(undefined, { isDashboard: true, forceRefresh })
			.subscribe({
				next: (response) => {
					console.log("Resolved charts data:", response);

					this.isRefreshing = false;
					this.charts = response;
					this.cdr.markForCheck();
				},
				error: (error) => {
					console.error("Error fetching charts:", error);
					this.error =
						error.error ||
						"Failed to refresh charts. Please try again.";

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
