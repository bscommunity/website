import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

import {
	CustomSelectComponent,
	type Option,
} from "@/components/custom-select/custom-select.component";
import { FilterPanelComponent } from "./subcomponents/filter-panel/filter-panel.component";
import { ListSectionComponent } from "./subcomponents/list-section.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { ChartComponent } from "./subcomponents/chart.component";

import { ChartModel } from "@/models/chart.model";
import { ChartService } from "@/services/api/chart.service";

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
		this.chartService.getAllCharts().subscribe({
			next: (response) => {
				console.log("Resolved charts data:", this.charts);

				this.charts = response;
				this.cdr.detectChanges();

				console.log(this.charts);
			},
			error: (error) => {
				console.error("Error fetching charts:", error);
				this.error = error.message;

				this.charts = null;
				this.cdr.detectChanges();

				console.log(this.charts);
			},
		});
	}

	clearFilters() {
		// Clear filters
	}
}
