import {
	ChangeDetectorRef,
	Component,
	inject,
	OnInit,
	OnDestroy,
} from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialog } from "@angular/material/dialog";

// Services
import { ChartService } from "@/services/api/chart.service";
import {
	WorkshopFilterService,
	WorkshopFilters,
} from "@/services/workshop-filter.service";

// Components
import { Option, SelectComponent } from "@/components/select/select.component";
import { FilterPanelComponent } from "@/components/filter-panel/filter-panel.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { PanelComponent } from "@/components/panel/panel.component";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

// Dialogs
import { ChartDialogComponent } from "@/components/dialogs/chart/chart-dialog.component";

// Models
import { ChartModel } from "@/models/chart.model";
import {
	getSortOptionLabel,
	SortOption,
} from "@/models/enums/sort-option.enum";

@Component({
	selector: "app-workshop",
	imports: [
		AsyncPipe,
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
export class WorkshopComponent implements OnInit, OnDestroy {
	private chartService = inject(ChartService);
	private filterService = inject(WorkshopFilterService);
	private cdr = inject(ChangeDetectorRef);
	private dialog = inject(MatDialog);

	private destroy$ = new Subject<void>();

	// Make getSortOptionLabel available in template
	getSortOptionLabel = getSortOptionLabel;

	// Observables from filter service
	filters$ = this.filterService.filters$;
	isLoading$ = this.filterService.isLoading$;
	error$ = this.filterService.error$;

	// Sort options
	sortOptions: Option[] = Object.values(SortOption).map((option) => ({
		value: option,
		label: getSortOptionLabel(option),
	}));

	// Current data
	charts: ChartModel[] | undefined = undefined;

	ngOnInit(): void {
		// Subscribe to filter changes and reload charts
		this.filterService
			.getFilterChanges$()
			.pipe(takeUntil(this.destroy$))
			.subscribe((filters) => {
				this.loadChartsWithFilters(filters);
			});

		// Load charts with initial filters
		this.loadChartsWithFilters(this.filterService.getFilters());
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	/**
	 * Load charts based on provided filters
	 */
	private loadChartsWithFilters(filters: WorkshopFilters): void {
		this.filterService.setLoading(true);
		this.filterService.setError(null);
		this.charts = undefined;

		this.chartService
			.searchChartsWithFilters(filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					console.log("Loaded charts:", response);
					this.charts = response;
					this.filterService.setLoading(false);
					this.cdr.markForCheck();
				},
				error: (error) => {
					console.error("Error loading charts:", error);
					const errorMessage =
						error.error?.message ||
						"Failed to load charts. Please try again.";
					this.filterService.setError(errorMessage);
					this.charts = [];
					this.cdr.markForCheck();
				},
			});
	}

	/**
	 * Refresh charts (public method for template)
	 */
	refreshCharts(): void {
		this.loadChartsWithFilters(this.filterService.getFilters());
	}

	/**
	 * Handle search input from searchbar
	 */
	onSearch(query: string): void {
		console.log("Search query:", query);
		this.filterService.setQuery(query);
	}

	/**
	 * Handle filter changes from filter panel
	 */
	onFilterChange(filters: any[]): void {
		console.log("Selected filters:", filters);
		// Filter panel component will handle updating the service
		// This is here for potential future use
	}

	/**
	 * Clear all active filters
	 */
	clearFilters(): void {
		this.filterService.resetFilters();
	}

	/**
	 * Handle sort selection
	 */
	onSortChange(sortBy: Option): void {
		console.log("Sort by:", sortBy);
		this.filterService.setSortBy(sortBy.value as SortOption);
	}

	/**
	 * Open chart dialog
	 */
	openChartDialog(chart: ChartModel): void {
		this.dialog.open(ChartDialogComponent, {
			data: {
				chart,
			},
			width: "575px",
		});
	}

	/**
	 * Check if there are active filters
	 */
	hasActiveFilters(): boolean {
		return this.filterService.hasActiveFilters();
	}

	/**
	 * Get count of active filters for display
	 */
	getActiveFilterCount(): number {
		return Object.values(this.filterService.getActiveFilters()).reduce(
			(count, val) => {
				if (Array.isArray(val)) return count + val.length;
				return count + (val ? 1 : 0);
			},
			0,
		);
	}
}
