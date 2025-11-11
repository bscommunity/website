import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Services
import { ChartService } from "@/services/api/chart.service";

// Components
import { Option, SelectComponent } from "@/components/select/select.component";
import { FilterPanelComponent } from "@/components/filter-panel/filter-panel.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Lib

// Models & Types
import {
	ChartModel,
	ChartModelWithLatestVersion,
	withLatestVersion,
} from "@/models/chart.model";

// Enums
import { Difficulty } from "@/models/enums/difficulty.enum";
import { Genre } from "@/models/enums/genre.enum";
import { LargePanelComponent } from "@/components/panel/large-panel.component";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

@Component({
	selector: "app-workshop",
	imports: [
		MatButtonModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
		MatIconModule,
		FilterPanelComponent,
		SearchbarComponent,
		SelectComponent,
		PanelComponent,
		ChartPreviewComponent,
	],
	templateUrl: "./workshop.html",
})
export class WorkshopComponent implements OnInit {
	private chartService = inject(ChartService);
	private cdr = inject(ChangeDetectorRef);

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
		const charts: ChartModelWithLatestVersion[] =
			value?.map(withLatestVersion) || [];

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

		this._charts = charts.sort((a, b) => {
			const dateA = a.latestVersion?.publishedAt
				? new Date(a.latestVersion.publishedAt)
				: new Date(0);
			const dateB = b.latestVersion?.publishedAt
				? new Date(b.latestVersion.publishedAt)
				: new Date(0);
			return dateB.getTime() - dateA.getTime();
		});
	}

	get charts(): ChartModelWithLatestVersion[] | undefined {
		return this._charts;
	}

	private _charts!: ChartModelWithLatestVersion[] | undefined;

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
		this.chartService.getAllCharts(forceRefresh).subscribe({
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
