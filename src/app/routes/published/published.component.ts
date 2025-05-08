import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import {
	CustomSelectComponent,
	type Option,
} from "@/components/custom-select/custom-select.component";
import { ChartComponent } from "./subcomponents/chart.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { FilterPanelComponent } from "./subcomponents/filter-panel/filter-panel.component";
import { ListSectionComponent } from "./subcomponents/list-section.component";

// Types
import { ChartModel } from "@/models/chart.model";

// Services
import { ChartService } from "@/services/api/chart.service";
import { LargePanelComponent } from "../../components/panel/large-panel.component";

@Component({
	selector: "app-published",
	imports: [
		MatIconModule,
		MatButtonModule,
		CustomSelectComponent,
		FilterPanelComponent,
		ListSectionComponent,
		ChartComponent,
		RouterLink,
		MatProgressSpinnerModule,
		SearchbarComponent,
		LargePanelComponent,
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

		this.charts = undefined;
		this.error = "";
		this.chartService.getAllCharts(forceRefresh).subscribe({
			next: (response) => {
				// console.log("Resolved charts data:", this.charts);

				this.charts = response;
				this.cdr.detectChanges();

				// console.log(this.charts);
			},
			error: (error) => {
				console.error("Error fetching charts:", error);
				this.error = error.message;

				this.charts = null;
				this.cdr.detectChanges();

				// console.log(this.charts);
			},
		});
	}
}
