import {
	ChangeDetectorRef,
	Component,
	inject,
	OnInit,
	OnDestroy,
	ViewChild,
	AfterViewInit,
} from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {
	MatPaginatorIntl,
	MatPaginatorModule,
	PageEvent,
} from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";

// Services
import { ChartService } from "@/services/api/chart.service";
import { FilterService } from "@/services/filter.service";
import type { WorkshopFilters } from "@/services/filter.service";

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

// Intl
import { PaginatorIntl } from "@/components/paginator/paginator-intl";

@Component({
	selector: "app-workshop",
	imports: [
		AsyncPipe,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
		MatIconModule,
		MatPaginatorModule,
		FilterPanelComponent,
		SearchbarComponent,
		SelectComponent,
		PanelComponent,
		ChartPreviewComponent,
	],
	providers: [{ provide: MatPaginatorIntl, useClass: PaginatorIntl }],
	templateUrl: "./workshop.html",
})
export class WorkshopComponent implements OnInit, OnDestroy, AfterViewInit {
	private chartService = inject(ChartService);
	private filterService = inject(FilterService);
	private cdr = inject(ChangeDetectorRef);
	private dialog = inject(MatDialog);

	private destroy$ = new Subject<void>();

	@ViewChild("searchbar") searchbar!: SearchbarComponent;

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
	totalCharts = 0;
	currentPage = 1;
	pageSize = 20;

	ngOnInit(): void {
		// Subscribe to filter changes and reload charts
		this.filterService.filterChanges$
			.pipe(takeUntil(this.destroy$))
			.subscribe((filters) => {
				this.currentPage = 1; // Reset to first page on filter change
				this.loadChartsWithFilters(filters);
			});

		// Subscribe to clear search events
		this.filterService.clearSearch$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.searchbar.clearSearch();
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngAfterViewInit(): void {
		this.searchbar.setValue(this.filterService.getFilters().query);
	}

	/**
	 * Load charts based on provided filters
	 */
	private loadChartsWithFilters(filters: WorkshopFilters): void {
		this.charts = undefined;
		this.filterService.setLoading(true);
		this.filterService.setError(null);

		const offset = (this.currentPage - 1) * this.pageSize;

		this.chartService
			.getCharts(filters, {
				limit: this.pageSize,
				offset,
				storage: "session",
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					console.log("Loaded charts:", response);
					this.charts = response.first;
					this.totalCharts = response.second;
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
					this.filterService.setLoading(false);
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
	 * Handle page change
	 */
	onPageChange(event: PageEvent): void {
		this.currentPage = event.pageIndex + 1;
		this.loadChartsWithFilters(this.filterService.getFilters());
	}

	/**
	 * Get total pages
	 */
	get totalPages(): number {
		return Math.ceil(this.totalCharts / this.pageSize);
	}

	/**
	 * Check if there are active filters
	 */
	hasActiveFilters(): boolean {
		return this.filterService.hasActiveFilters();
	}
}
