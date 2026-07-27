import {
	ChangeDetectorRef,
	Component,
	inject,
	OnInit,
	OnDestroy,
	ViewChild,
	AfterViewInit,
	HostListener,
} from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgGlyph } from "@ng-icons/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialog } from "@angular/material/dialog";

// Services
import { ChartService } from "@/services/api/chart.service";
import { UserService } from "@/services/api/user.service";
import { FilterService } from "@/services/filter.service";
import type { WorkshopFilters } from "@/services/filter.service";

// Components
import { Option, SelectComponent } from "@/components/select/select.component";
import { FilterPanelComponent } from "@/components/filter-panel/filter-panel.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { PanelComponent } from "@/components/panel/panel.component";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";
import { TourpassPreviewComponent } from "@/components/tourpass-preview/tourpass-preview.component";

// Dialogs
import { ChartDialogComponent } from "@/components/dialogs/chart/chart-dialog.component";
import { TourPassDialogComponent } from "@/components/dialogs/tourpass/tourpass-dialog.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { TourPassModel } from "@/models/tour-pass.model";
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
		NgGlyph,
		FilterPanelComponent,
		SearchbarComponent,
		SelectComponent,
		PanelComponent,
		ChartPreviewComponent,
		TourpassPreviewComponent,
	],
	templateUrl: "./workshop.html",
})
export class WorkshopComponent implements OnInit, OnDestroy, AfterViewInit {
	private chartService = inject(ChartService);
	private userService = inject(UserService);
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
	tourPasses: TourPassModel[] = [];
	totalItems = 0;
	currentPage = 1;
	pageSize = 20;
	placeholders = Array(20);

	ngOnInit(): void {
		// Initial load (immediate, no debounce)
		this.loadWithFilters(this.filterService.getFilters());

		// Subscribe to filter changes and reload
		this.filterService.filterChanges$
			.pipe(takeUntil(this.destroy$))
			.subscribe((filters) => {
				this.currentPage = 1;
				this.loadWithFilters(filters);
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
	 * Load content based on provided filters
	 */
	private loadWithFilters(filters: WorkshopFilters, append = false): void {
		if (!append) {
			this.charts = undefined;
			this.tourPasses = [];
		}
		this.filterService.setLoading(true);
		this.filterService.setError(null);

		const offset = append
			? (this.currentPage - 1) * this.pageSize
			: 0;

		// Load charts
		this.chartService
			.getCharts(filters, {
				limit: this.pageSize,
				offset,
				storage: "session",
				count: true,
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					if (append) {
						this.charts = [...(this.charts || []), ...response.first];
					} else {
						this.charts = response.first;
					}
					if (response.second !== null) {
						this.totalItems = response.second;
					}
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

		// Load tour passes
		this.userService
			.getPublicTourPasses({
				limit: this.pageSize,
				offset,
				count: true,
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					if (append) {
						this.tourPasses = [...this.tourPasses, ...response[0]];
					} else {
						this.tourPasses = response[0];
					}
					if (response[1] !== null) {
						this.totalItems = Math.max(this.totalItems, response[1]);
					}
					this.cdr.markForCheck();
				},
				error: (error) => {
					console.error("Error loading tour passes:", error);
				},
			});
	}

	/**
	 * Refresh content (public method for template)
	 */
	refreshContent(): void {
		this.loadWithFilters(this.filterService.getFilters());
	}

	/**
	 * Handle search input from searchbar
	 */
	onSearch(query: string): void {
		this.filterService.setQuery(query);
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
			maxHeight: "85vh",
		});
	}

	/**
	 * Open tour pass dialog
	 */
	openTourPassDialog(tourpass: TourPassModel): void {
		this.dialog.open(TourPassDialogComponent, {
			data: {
				tourpass,
			},
			width: "575px",
			maxHeight: "85vh",
		});
	}

	/**
	 * Handle scroll for infinite scroll
	 */
	@HostListener("window:scroll")
	onScroll(): void {
		const scrollPosition = window.innerHeight + window.scrollY;
		const documentHeight = document.documentElement.scrollHeight;

		if (
			scrollPosition >= documentHeight - 200 &&
			(this.charts?.length ?? 0) < this.totalItems &&
			!(this.isLoading$ as any)?.value
		) {
			this.currentPage++;
			this.loadWithFilters(this.filterService.getFilters(), true);
		}
	}

	/**
	 * Check if there are active filters
	 */
	hasActiveFilters(): boolean {
		return this.filterService.hasActiveFilters();
	}
}
