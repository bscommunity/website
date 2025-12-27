import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	inject,
} from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import {
	SelectComponent,
	type Option,
} from "@/components/select/select.component";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { FilterPanelComponent } from "@/components/filter-panel/filter-panel.component";
import { LargePanelComponent } from "@/components/panel/large-panel.component";
import { ListSectionComponent } from "./subcomponents/list-section.component";

// Models
import { ChartModel, withLatestVersion } from "@/models/chart.model";

// Services
import { ChartService } from "@/services/api/chart.service";
import { FilterService } from "@/services/filter.service";
import type { WorkshopFilters } from "@/services/filter.service";

// Utils
import { convertStringToMonth } from "@/lib/time";

// Enums
import {
	getSortOptionLabel,
	SortOption,
} from "@/models/enums/sort-option.enum";

interface ChartsByMonth {
	name: string; // e.g., "2023-10"
	charts: ChartModel[];
}

@Component({
	selector: "app-uploads",
	imports: [
		AsyncPipe,
		MatIconModule,
		MatButtonModule,
		SelectComponent,
		FilterPanelComponent,
		ListSectionComponent,
		ChartPreviewComponent,
		MatProgressSpinnerModule,
		SearchbarComponent,
		LargePanelComponent,
		ChartPreviewComponent,
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

	set charts(value: ChartModel[] | undefined) {
		const charts: ChartModel[] = value?.map(withLatestVersion) || [];

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
}
