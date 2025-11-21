import { Injectable } from "@angular/core";
import {
	BehaviorSubject,
	Observable,
	combineLatest,
	debounceTime,
	distinctUntilChanged,
	Subject,
	skip,
	shareReplay,
} from "rxjs";

// Models
import { z } from "zod";
import { SortOption } from "@/models/enums/sort-option.enum";

const DEFAULT_SORT_OPTION = SortOption.LAST_UPDATED;
const FILTER_CHANGE_DEBOUNCE_MS = 600;

/**
 * Schema for workshop filters
 * Validates and parses filter data
 */
const WorkshopFiltersSchema = z.object({
	query: z.string().default(""),
	genres: z.array(z.string()).default([]),
	difficulties: z.array(z.string()).default([]),
	categories: z.array(z.string()).default([]),
	versions: z.array(z.string()).default([]),
	sortBy: z.enum(SortOption).default(SortOption.LAST_UPDATED),
});

export type WorkshopFilters = z.infer<typeof WorkshopFiltersSchema>;

type FilterKey = keyof WorkshopFilters;
type ArrayFilterKey = Exclude<FilterKey, "query" | "sortBy">;

export interface WorkshopFilterState {
	filters: WorkshopFilters;
	isLoading: boolean;
	error: string | null;
}

@Injectable({
	providedIn: "root",
})
export class FilterService {
	// Private state subjects
	private readonly filtersSubject = new BehaviorSubject<WorkshopFilters>(
		this.getDefaultFilters(),
	);
	private readonly isLoadingSubject = new BehaviorSubject<boolean>(true);
	private readonly errorSubject = new BehaviorSubject<string | null>(null);
	private readonly clearSearchSubject = new Subject<void>();

	// Public observables
	readonly filters$ = this.filtersSubject
		.asObservable()
		.pipe(
			distinctUntilChanged(
				(a, b) => JSON.stringify(a) === JSON.stringify(b),
			),
		);

	readonly isLoading$ = this.isLoadingSubject.asObservable();
	readonly error$ = this.errorSubject.asObservable();
	readonly clearSearch$ = this.clearSearchSubject.asObservable();

	/**
	 * Combined state observable - use this for comprehensive state management
	 */
	readonly state$: Observable<WorkshopFilterState> = combineLatest({
		filters: this.filters$,
		isLoading: this.isLoading$,
		error: this.error$,
	});

	/**
	 * Debounced filter changes - use this to trigger API calls
	 * Emits only when filters actually change, with configurable debounce
	 */
	readonly filterChanges$ = this.filters$.pipe(
		skip(1), // ignore the initial BehaviorSubject emission
		debounceTime(FILTER_CHANGE_DEBOUNCE_MS),
		distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
		shareReplay({ bufferSize: 1, refCount: true }),
	);

	// ===== FILTER OPERATIONS =====

	/**
	 * Get current filters synchronously
	 */
	getFilters(): WorkshopFilters {
		return this.filtersSubject.value;
	}

	/**
	 * Set search query
	 */
	setQuery(query: string): void {
		this.updateFilters({ query });
	}

	/**
	 * Set sort option
	 */
	setSortBy(sortBy: SortOption): void {
		this.updateFilters({ sortBy });
	}

	/**
	 * Set multiple filters at once (batch update)
	 * This is more efficient than multiple individual updates
	 */
	updateFilters(partial: Partial<WorkshopFilters>): void {
		const current = this.filtersSubject.value;
		const updated = WorkshopFiltersSchema.parse({
			...current,
			...partial,
		});
		this.filtersSubject.next(updated);
	}

	/**
	 * Toggle a single item in an array filter (genres, difficulties, etc.)
	 */
	toggleFilterItem(key: ArrayFilterKey, value: string): void {
		const current = this.filtersSubject.value;
		const currentArray = current[key] as string[];
		const updated = currentArray.includes(value)
			? currentArray.filter((item) => item !== value)
			: [...currentArray, value];

		this.updateFilters({ [key]: updated });
	}

	/**
	 * Set entire array for a filter
	 */
	setFilterArray(key: ArrayFilterKey, values: string[]): void {
		this.updateFilters({ [key]: values });
	}

	/**
	 * Toggle genre filter
	 */
	toggleGenre(genre: string): void {
		this.toggleFilterItem("genres", genre);
	}

	/**
	 * Toggle difficulty filter
	 */
	toggleDifficulty(difficulty: string): void {
		this.toggleFilterItem("difficulties", difficulty);
	}

	/**
	 * Toggle category filter
	 */
	toggleCategory(category: string): void {
		this.toggleFilterItem("categories", category);
	}

	/**
	 * Toggle version filter
	 */
	toggleVersion(version: string): void {
		this.toggleFilterItem("versions", version);
	}

	/**
	 * Clear specific filter(s)
	 */
	clearFilter(key: FilterKey): void {
		const defaultValue = this.getDefaultFilters()[key];
		this.updateFilters({ [key]: defaultValue });
	}

	/**
	 * Clear multiple filters at once
	 */
	clearFilters(keys: FilterKey[]): void {
		const defaults = this.getDefaultFilters();
		const updates: Partial<WorkshopFilters> = {};

		keys.forEach((key) => {
			(updates as any)[key] = defaults[key];
		});

		this.updateFilters(updates);
	}

	/**
	 * Reset all filters to default
	 */
	resetFilters(): void {
		this.filtersSubject.next(this.getDefaultFilters());
		this.clearSearchSubject.next();
	}

	// ===== STATE MANAGEMENT =====

	/**
	 * Set loading state
	 */
	setLoading(isLoading: boolean): void {
		this.isLoadingSubject.next(isLoading);
	}

	/**
	 * Set error state
	 */
	setError(error: string | null): void {
		this.errorSubject.next(error);
	}

	/**
	 * Clear error
	 */
	clearError(): void {
		this.errorSubject.next(null);
	}

	// ===== UTILITY METHODS =====

	/**
	 * Check if any filters are active (non-default)
	 */
	hasActiveFilters(): boolean {
		const filters = this.filtersSubject.value;
		return !!(
			filters.query ||
			filters.genres.length ||
			filters.difficulties.length ||
			filters.categories.length ||
			filters.versions.length
		);
	}

	/**
	 * Check if a specific filter has values
	 */
	hasFilter(key: FilterKey): boolean {
		const value = this.filtersSubject.value[key];
		if (typeof value === "string") return !!value;
		if (Array.isArray(value)) return value.length > 0;
		return value !== this.getDefaultFilters()[key];
	}

	/**
	 * Get count of active filters
	 */
	getActiveFilterCount(): number {
		const filters = this.filtersSubject.value;
		let count = 0;

		if (filters.query) count++;
		if (filters.genres.length) count++;
		if (filters.difficulties.length) count++;
		if (filters.categories.length) count++;
		if (filters.versions.length) count++;

		return count;
	}

	/**
	 * Get only filters that have non-default values
	 */
	getActiveFilters(): Partial<WorkshopFilters> {
		const filters = this.filtersSubject.value;
		const active: Partial<WorkshopFilters> = {};

		if (filters.query) active.query = filters.query;
		if (filters.genres.length) active.genres = filters.genres;
		if (filters.difficulties.length)
			active.difficulties = filters.difficulties;
		if (filters.categories.length) active.categories = filters.categories;
		if (filters.versions.length) active.versions = filters.versions;
		if (filters.sortBy !== DEFAULT_SORT_OPTION)
			active.sortBy = filters.sortBy;

		return active;
	}

	/**
	 * Get current state synchronously
	 */
	getState(): WorkshopFilterState {
		return {
			filters: this.filtersSubject.value,
			isLoading: this.isLoadingSubject.value,
			error: this.errorSubject.value,
		};
	}

	// ===== PRIVATE HELPERS =====

	private getDefaultFilters(): WorkshopFilters {
		return {
			query: "",
			genres: [],
			difficulties: [],
			categories: [],
			versions: [],
			sortBy: DEFAULT_SORT_OPTION,
		};
	}
}
