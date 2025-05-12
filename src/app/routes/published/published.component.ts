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

// Types
import { ChartModel } from "@/models/chart.model";

// Services
import { ChartService } from "@/services/api/chart.service";

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

	charts: ChartModel[] | undefined | null = undefined;
	isRefreshing: boolean = true;
	error: string = "";

	ngOnInit(): void {
		// Access resolved data
		this.fetchCharts();
	}

	clearFilters() {
		// Clear filters
	}

	fetchCharts(forceRefresh: boolean = false) {
		// console.log("Refreshing charts...");

		this.isRefreshing = forceRefresh;
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
				this.charts = null;
				this.cdr.markForCheck();
			},
		});
	}
}
