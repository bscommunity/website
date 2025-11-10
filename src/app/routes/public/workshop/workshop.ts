import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";

// Services
import { ChartService } from "@/services/api/chart.service";

// Lib
import { convertStringToMonth } from "@/lib/time";

// Models & Types
import {
	ChartModel,
	ChartModelWithLatestVersion,
	withLatestVersion,
} from "@/models/chart.model";
import { Option } from "@/components/select/select.component";
import { Difficulty } from "@/models/enums/difficulty.enum";
import { Genre } from "@/models/enums/genre.enum";

@Component({
	selector: "app-workshop",
	imports: [MatButtonModule, MatTooltipModule, MatIconModule, RouterLink],
	templateUrl: "./workshop.html",
})
export class WorkshopComponent implements OnInit {
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
