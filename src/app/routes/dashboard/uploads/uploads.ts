import { AsyncPipe } from "@angular/common";
import {
	ChangeDetectorRef,
	Component,
	inject,
	type OnDestroy,
	type OnInit,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";

// Icons
import { NgGlyph } from "@ng-icons/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";
import { PublishDialogUploadingComponent } from "@/components/dialogs/uploading/uploading.component";
import { FilterPanelComponent } from "@/components/filter-panel/filter-panel.component";
import { LargePanelComponent } from "@/components/panel/large-panel.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";

// Components
import {
	type Option,
	SelectComponent,
} from "@/components/select/select.component";

// Utils
import { convertStringToMonth } from "@/lib/time";

// Models
import type { ChartModel } from "@/models/chart.model";

// Enums
import {
	getSortOptionLabel,
	SortOption,
} from "@/models/enums/sort-option.enum";

// Services
import { ChartService } from "@/services/api/chart.service";
import type { WorkshopFilters } from "@/services/filter.service";
import { FilterService } from "@/services/filter.service";
import { ListSectionComponent } from "./subcomponents/list-section.component";
import { PublishChartBatchComponent } from "@/components/publish/chart/batch.component";
import { TourpassPreviewComponent } from "@/components/tourpass-preview/tourpass-preview.component";
import { SAMPLE_TOURPASS_1 } from "@/lib/fake";

interface ChartsByMonth {
	name: string; // e.g., "2023-10"
	charts: ChartModel[];
}

@Component({
	selector: "app-uploads",
	imports: [
		AsyncPipe,
		NgGlyph,
		MatButtonModule,
		SelectComponent,
		FilterPanelComponent,
		ListSectionComponent,
		ChartPreviewComponent,
		MatProgressSpinnerModule,
		SearchbarComponent,
		LargePanelComponent,
		ChartPreviewComponent,
		TourpassPreviewComponent,
	],
	templateUrl: "./uploads.html",
})
export class Uploads implements OnInit, OnDestroy {
	private chartService = inject(ChartService);
	private filterService = inject(FilterService);
	private cdr = inject(ChangeDetectorRef);

	private destroy$ = new Subject<void>();

	convertStringToMonth = convertStringToMonth;

	// Sort options
	sortOptions: Option[] = Object.values(SortOption).map((option) => ({
		value: option,
		label: getSortOptionLabel(option),
	}));

	sortBy: Option = this.sortOptions[0];

	filters = [];

	tourpass = SAMPLE_TOURPASS_1;

	set charts(value: ChartModel[] | undefined) {
		const charts: ChartModel[] = value || [];

		const chartsByMonth: ChartsByMonth[] = [];
		charts.forEach((chart) => {
			const month = chart.latestVersion?.createdAt
				? new Date(chart.latestVersion.createdAt)
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

	error: string | undefined = undefined;

	// Expose observables (not used by template, but kept for parity and future use)
	filters$ = this.filterService.filters$;
	isLoading$ = this.filterService.isLoading$;
	error$ = this.filterService.error$;

	ngOnInit(): void {
		// Inicializar sort pela store de filtros (se existir)
		const initialFilters = this.filterService.getFilters();
		const initialSort = initialFilters.sortBy ?? this.sortOptions[0].value;
		this.sortBy =
			this.sortOptions.find((o) => o.value === initialSort) ||
			this.sortOptions[0];

		// Carregamento inicial
		this.fetchCharts();

		// Recarregar quando filtros mudarem
		this.filterService.filterChanges$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.fetchCharts();
			});

		// Sincronizar erros

		this.error$.pipe(takeUntil(this.destroy$)).subscribe((err) => {
			this.error = err || undefined;
			this.cdr.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	fetchCharts(disableCache = false) {
		const filters: WorkshopFilters = this.filterService.getFilters();
		this.error = undefined;
		this.filterService.setLoading(true);

		// isDashboard=true to fetch uploads specific data
		this.chartService
			.getCharts(filters, {
				isDashboard: true,
				disableCache,
				storage: "persistent",
				myCharts: true,
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					console.log("Resolved charts data:", response);
					this.charts = response.first;
					this.filterService.setLoading(false);
					this.filterService.setError(null);
					this.cdr.markForCheck();
				},
				error: (error) => {
					console.error("Error fetching charts:", error);
					const msg =
						error?.error?.message ||
						error?.error ||
						"Failed to refresh charts. Please try again.";
					this.filterService.setError(msg);
					this.filterService.setLoading(false);
					this.cdr.markForCheck();
				},
			});
	}

	onSortChange(sortBy: Option): void {
		this.filterService.setSortBy(sortBy.value as SortOption);
	}

	onSearch(query: string) {
		console.log("Search query:", query);
		this.filterService.setQuery(query);
	}

	clearFilters() {
		this.filterService.resetFilters();
	}

	hasActiveFilters(): boolean {
		return this.filterService.hasActiveFilters();
	}

	private dialog = inject(MatDialog);

	openMock() {
		this.dialog.open(PublishDialogUploadingComponent, {
			width: "450px",
		});
	}

	openBatchMock() {
		const dialogRef = this.dialog.open(PublishChartBatchComponent, {
			width: "600px",
		});
		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.fetchCharts(true);
			});
	}
}
