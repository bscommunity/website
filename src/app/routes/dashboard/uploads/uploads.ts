import { AsyncPipe } from "@angular/common";
import {
	ChangeDetectorRef,
	Component,
	inject,
	type OnDestroy,
	type OnInit,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";

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
	mapCategoriesToTypes,
	type ContentByMonth,
} from "@/lib/content-grouping";

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
import { BatchUploadQueueService } from "@/services/publish/batch-upload-queue.service";
import { ListSectionComponent } from "./subcomponents/list-section.component";
import { TourpassPreviewComponent } from "@/components/tourpass-preview/tourpass-preview.component";

@Component({
	selector: "app-uploads",
	imports: [
		AsyncPipe,
		NgGlyph,
		MatButtonModule,
		RouterModule,
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
	private batchUploadQueue = inject(BatchUploadQueueService);
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

	// Unified content grouped by date, then by type
	contentByMonth: ContentByMonth[] = [];
	totalCount = 0;
	currentOffset = 0;
	private readonly pageSize = 20;
	hasMore = false;

	error: string | undefined = undefined;

	placeholders = Array(20);

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

		// Ensure uploads starts with no category filter (show all types)
		if (initialFilters.categories.length > 0) {
			this.filterService.setFilterArray("categories", []);
		}

		this.fetchContent();

		this.filterService.filterChanges$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.currentOffset = 0;
				this.fetchContent();
			});

		this.batchUploadQueue.uploadCompleted$
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
				genres: filters.genres?.length
					? filters.genres.join(",")
					: undefined,
				difficulties: filters.difficulties?.length
					? filters.difficulties.join(",")
					: undefined,
				versions: filters.versions?.length
					? filters.versions.join(",")
					: undefined,
				limit: this.pageSize,
				offset: append ? this.currentOffset : 0,
				disableCache,
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					const items = response.items || [];
					console.log(
						"Fetched uploads:",
						items,
						"Total count:",
						response.total,
					);

					if (append) {
						this.contentByMonth = this.mergeGroupedContent(
							this.contentByMonth,
							groupByMonth(items),
						);
						this.currentOffset += items.length;
					} else {
						this.contentByMonth = groupByMonth(items);
						this.currentOffset = items.length;
					}

					this.totalCount = response.total ?? 0;
					this.hasMore = items.length >= this.pageSize;

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
		const merged = new Map<string, ContentByMonth>();

		for (const group of existing) {
			merged.set(group.name, {
				name: group.name,
				charts: [...group.charts],
				tourPasses: [...group.tourPasses],
				themes: [...group.themes],
			});
		}

		for (const group of newItems) {
			const target = merged.get(group.name) ?? {
				name: group.name,
				charts: [],
				tourPasses: [],
				themes: [],
			};

			const existingIds = new Set([
				...target.charts.map((i) => i.id),
				...target.tourPasses.map((i) => i.id),
				...target.themes.map((i) => i.id),
			]);

			for (const item of group.charts) {
				if (!existingIds.has(item.id)) target.charts.push(item);
			}
			for (const item of group.tourPasses) {
				if (!existingIds.has(item.id)) target.tourPasses.push(item);
			}
			for (const item of group.themes) {
				if (!existingIds.has(item.id)) target.themes.push(item);
			}

			merged.set(group.name, target);
		}

		return Array.from(merged.values()).sort((a, b) =>
			b.name.localeCompare(a.name),
		);
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

	get hasAnyContent(): boolean {
		return this.contentByMonth.some(
			(m) =>
				m.charts.length > 0 ||
				m.tourPasses.length > 0 ||
				m.themes.length > 0,
		);
	}

	hasActiveFilters(): boolean {
		return this.filterService.hasActiveFilters();
	}
}
