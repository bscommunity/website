import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";

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
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

// Models
import { ChartModel, } from "@/models/chart.model";

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

	charts: ChartModel[] | undefined = undefined;
	error?: string;

	ngOnInit(): void {
		// Access resolved data
		this.fetchCharts();
	}

	clearFilters() {
		// Clear filters
	}

	fetchCharts() {
		this.error = undefined;
		this.chartService.getCharts().subscribe({
			next: (response) => {
				console.log("Resolved charts data:", response);

				this.charts = response;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error("Error fetching charts:", error);
				this.error =
					error.error ||
					"Failed to refresh charts. Please try again.";

				this.cdr.markForCheck();
			},
		});
	}

	onSearch(query: string) {
		console.log("Search query:", query);

		// Handle search query
		this.chartService.searchCharts(query).subscribe({
			next: (response) => {
				this.charts = response;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error("Error searching charts:", error);
				this.error =
					error.error ||
					"Failed to search charts. Please try again.";

				this.cdr.markForCheck();
			},
		});
	}
}
