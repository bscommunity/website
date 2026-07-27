import { AsyncPipe } from "@angular/common";
import {
	ChangeDetectorRef,
	Component,
	inject,
	type OnDestroy,
	type OnInit,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink } from "@angular/router";

// Icons
import { NgGlyph } from "@ng-icons/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";
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
import {
	groupByMonth,
	isChart,
	isTourPass,
	isTheme,
	mapCategoriesToTypes,
	type ContentByMonth,
} from "@/lib/content-grouping";

// Models
import type { CatalogItemModel } from "@/models/catalog-item.model";

// Enums
import {
	getSortOptionLabel,
	SortOption,
} from "@/models/enums/sort-option.enum";

// Services
import { UserService } from "@/services/api/user.service";
import { AuthService } from "@/services/auth.service";
import type { WorkshopFilters } from "@/services/filter.service";
import { FilterService } from "@/services/filter.service";
import { ListSectionComponent } from "./subcomponents/list-section.component";
import { TourpassPreviewComponent } from "@/components/tourpass-preview/tourpass-preview.component";

@Component({
	selector: "app-uploads",
	imports: [
		AsyncPipe,
		NgGlyph,
		MatButtonModule,
		RouterLink,
		SelectComponent,
		FilterPanelComponent,
		ListSectionComponent,
		ChartPreviewComponent,
		MatProgressSpinnerModule,
		SearchbarComponent,
		LargePanelComponent,
		TourpassPreviewComponent,
	],
	templateUrl: "./uploads.html",
})
export class Uploads implements OnInit, OnDestroy {
	private filterService = inject(FilterService);
	private userService = inject(UserService);
	private authService = inject(AuthService);
	private cdr = inject(ChangeDetectorRef);

	private destroy$ = new Subject<void>();

	convertStringToMonth = convertStringToMonth;
	isChart = isChart;
	isTourPass = isTourPass;
	isTheme = isTheme;

	// Sort options
	sortOptions: Option[] = Object.values(SortOption).map((option) => ({
		value: option,
		label: getSortOptionLabel(option),
	}));

	sortBy: Option = this.sortOptions[0];

	filters = [];

	// Unified content
	contentByMonth: ContentByMonth[] = [];
	totalCount = 0;
	currentOffset = 0;
	private readonly pageSize = 20;
	hasMore = false;

	error: string | undefined = undefined;

	// Expose observables
	filters$ = this.filterService.filters$;
	isLoading$ = this.filterService.isLoading$;
	error$ = this.filterService.error$;

	ngOnInit(): void {
		const initialFilters = this.filterService.getFilters();
		const initialSort = initialFilters.sortBy ?? this.sortOptions[0].value;
		this.sortBy =
			this.sortOptions.find((o) => o.value === initialSort) ||
			this.sortOptions[0];

		this.fetchContent();

		this.filterService.filterChanges$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.currentOffset = 0;
				this.fetchContent();
			});

		this.error$.pipe(takeUntil(this.destroy$)).subscribe((err) => {
			this.error = err || undefined;
			this.cdr.markForCheck();
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	fetchContent(disableCache = false, append = false) {
		const filters: WorkshopFilters = this.filterService.getFilters();
		this.error = undefined;
		this.filterService.setLoading(true);

		const types = mapCategoriesToTypes(filters.categories);

		this.userService
			.getMyUploads({
				types,
				query: filters.query || undefined,
				sortBy: filters.sortBy || undefined,
				limit: this.pageSize,
				offset: append ? this.currentOffset : 0,
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					const items = response.items || [];

					if (append) {
						// Append new items to existing grouped content
						const newGrouped = groupByMonth(items);
						this.contentByMonth = this.mergeGroupedContent(
							this.contentByMonth,
							newGrouped,
						);
						this.currentOffset += items.length;
					} else {
						this.contentByMonth = groupByMonth(items);
						this.currentOffset = items.length;
					}

					this.totalCount =
						(response.counts?.charts ?? 0) +
						(response.counts?.tourPasses ?? 0) +
						(response.counts?.themes ?? 0);
					this.hasMore = this.currentOffset < this.totalCount;

					this.filterService.setLoading(false);
					this.filterService.setError(null);
					this.cdr.markForCheck();
				},
				error: (error) => {
					console.error("Error fetching uploads:", error);
					const msg =
						error?.error?.message ||
						error?.error ||
						"Failed to refresh uploads. Please try again.";
					this.filterService.setError(msg);
					this.filterService.setLoading(false);
					this.cdr.markForCheck();
				},
			});
	}

	loadMore() {
		if (this.hasMore) {
			this.fetchContent(false, true);
		}
	}

	private mergeGroupedContent(
		existing: ContentByMonth[],
		newItems: ContentByMonth[],
	): ContentByMonth[] {
		const merged = new Map<string, CatalogItemModel[]>();

		// Add existing items
		for (const group of existing) {
			merged.set(group.name, [...group.items]);
		}

		// Add new items
		for (const group of newItems) {
			const existingItems = merged.get(group.name) || [];
			const existingIds = new Set(existingItems.map((i) => i.id));
			const uniqueNew = group.items.filter((i) => !existingIds.has(i.id));
			merged.set(group.name, [...existingItems, ...uniqueNew]);
		}

		return Array.from(merged.entries())
			.sort(([a], [b]) => b.localeCompare(a))
			.map(([name, items]) => ({ name, items }));
	}

	onSortChange(sortBy: Option): void {
		this.filterService.setSortBy(sortBy.value as SortOption);
	}

	onSearch(query: string) {
		this.filterService.setQuery(query);
	}

	clearFilters() {
		this.filterService.resetFilters();
	}

	refresh(disableCache = false) {
		this.currentOffset = 0;
		this.fetchContent(disableCache);
	}

	hasActiveFilters(): boolean {
		return this.filterService.hasActiveFilters();
	}
}
