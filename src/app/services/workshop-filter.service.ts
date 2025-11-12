import { Injectable } from "@angular/core";
import {
	BehaviorSubject,
	Observable,
	Subject,
	debounceTime,
	distinctUntilChanged,
	map,
	tap,
} from "rxjs";

// Models
import { z } from "zod";
import { SortOption } from "@/models/enums/sort-option.enum";

const DefaultSortOption = SortOption.LAST_UPDATED;

/**
 * Schema for workshop filters
 * Validates and parses filter data
 */
const WorkshopFiltersSchema = z.object({
	query: z.string().optional().default(""),
	genres: z.array(z.string()).optional().default([]),
	difficulties: z.array(z.string()).optional().default([]),
	categories: z.array(z.string()).optional().default([]),
	versions: z.array(z.string()).optional().default([]),
	sortBy: z
		.nativeEnum(SortOption)
		.optional()
		.default(SortOption.LAST_UPDATED),
});

export type WorkshopFilters = z.infer<typeof WorkshopFiltersSchema>;

type FilterKey = keyof WorkshopFilters;

export interface FilterContextConfig {
	id: string;
	enabled: FilterKey[]; // which filters are allowed/used by the screen
	defaults?: Partial<WorkshopFilters>;
	meta?: {
		isDashboard?: boolean; // used by API to restrict results to logged user
	};
}

interface WorkshopFilterState {
	filters: WorkshopFilters;
	isLoading: boolean;
	error: string | null;
}

/**
 * WorkshopFilterService
 *
 * Centralizes filter, search, and sort state management for the workshop.
 * Uses an internal reactive state (no URL query params).
 *
 * Strategy:
 * - Service as single source of truth
 * - RxJS for reactive updates and debouncing
 * - Type-safe with Zod validation
 */
@Injectable({
	providedIn: "root",
})
export class WorkshopFilterService {
	private readonly defaultScopeId = "workshop";

	// Contexts registry
	private contexts = new Map<
		string,
		{
			config: FilterContextConfig;
			filtersSubject: BehaviorSubject<WorkshopFilters>;
			isLoadingSubject: BehaviorSubject<boolean>;
			errorSubject: BehaviorSubject<string | null>;
			filterTriggerSubject: Subject<WorkshopFilters>;
			stateSubject: BehaviorSubject<WorkshopFilterState>;
		}
	>();

	// Convenience observables for default scope to preserve current API
	filters$ = this.ensureScope(this.defaultScopeId)
		.filtersSubject.asObservable()
		.pipe(distinctUntilChanged());
	isLoading$ = this.ensureScope(
		this.defaultScopeId,
	).isLoadingSubject.asObservable();
	error$ = this.ensureScope(this.defaultScopeId).errorSubject.asObservable();
	state$ = this.ensureScope(this.defaultScopeId).stateSubject.asObservable();

	constructor() {}

	private ensureScope(scopeId: string) {
		let ctx = this.contexts.get(scopeId);
		if (!ctx) {
			// If not configured, register with permissive defaults
			this.configureScope(scopeId, {
				id: scopeId,
				enabled: [
					"query",
					"genres",
					"difficulties",
					"categories",
					"versions",
					"sortBy",
				],
				defaults: this.getDefaultFilters(),
				meta: { isDashboard: false },
			});
			ctx = this.contexts.get(scopeId)!;
		}
		return ctx;
	}

	configureScope(scopeId: string, config: FilterContextConfig): void {
		const defaults: WorkshopFilters = WorkshopFiltersSchema.parse({
			...this.getDefaultFilters(),
			...(config.defaults || {}),
		});

		const filtersSubject = new BehaviorSubject<WorkshopFilters>(defaults);
		const isLoadingSubject = new BehaviorSubject<boolean>(false);
		const errorSubject = new BehaviorSubject<string | null>(null);
		const filterTriggerSubject = new Subject<WorkshopFilters>();
		const stateSubject = new BehaviorSubject<WorkshopFilterState>({
			filters: defaults,
			isLoading: false,
			error: null,
		});

		// Debounce and propagate per-scope
		filtersSubject
			.pipe(
				debounceTime(300),
				distinctUntilChanged(
					(prev, curr) =>
						JSON.stringify(prev) === JSON.stringify(curr),
				),
				tap((filters) => {
					filterTriggerSubject.next(filters);
					stateSubject.next({
						filters,
						isLoading: isLoadingSubject.value,
						error: errorSubject.value,
					});
				}),
			)
			.subscribe();

		this.contexts.set(scopeId, {
			config,
			filtersSubject,
			isLoadingSubject,
			errorSubject,
			filterTriggerSubject,
			stateSubject,
		});
	}

	/**
	 * Get default filters
	 */
	private getDefaultFilters(): WorkshopFilters {
		return {
			query: "",
			genres: [],
			difficulties: [],
			categories: [],
			versions: [],
			sortBy: DefaultSortOption,
		};
	}

	/**
	 * Update state
	 */
	private updateState(scopeId: string = this.defaultScopeId): void {
		const ctx = this.ensureScope(scopeId);
		ctx.stateSubject.next({
			filters: ctx.filtersSubject.value,
			isLoading: ctx.isLoadingSubject.value,
			error: ctx.errorSubject.value,
		});
	}

	// ===== PUBLIC API =====

	/**
	 * Get current filters (synchronous access)
	 */
	getFilters(scopeId: string = this.defaultScopeId): WorkshopFilters {
		return this.ensureScope(scopeId).filtersSubject.value;
	}

	/**
	 * Get observable for debounced filter changes
	 * Use this to trigger API calls
	 */
	getFilterChanges$(
		scopeId: string = this.defaultScopeId,
	): Observable<WorkshopFilters> {
		return this.ensureScope(scopeId)
			.filterTriggerSubject.asObservable()
			.pipe(
				distinctUntilChanged(
					(prev, curr) =>
						JSON.stringify(prev) === JSON.stringify(curr),
				),
			);
	}

	/**
	 * Set search query
	 */
	setQuery(query: string, scopeId: string = this.defaultScopeId): void {
		const ctx = this.ensureScope(scopeId);
		if (!this.isEnabled("query", scopeId)) return;
		const current = ctx.filtersSubject.value;
		ctx.filtersSubject.next({ ...current, query });
	}

	/**
	 * Set sort option
	 */
	setSortBy(sortBy: SortOption, scopeId: string = this.defaultScopeId): void {
		const ctx = this.ensureScope(scopeId);
		if (!this.isEnabled("sortBy", scopeId)) return;
		const current = ctx.filtersSubject.value;
		ctx.filtersSubject.next({ ...current, sortBy });
	}

	/**
	 * Toggle genre filter
	 */
	toggleGenre(genre: string, scopeId: string = this.defaultScopeId): void {
		if (!this.isEnabled("genres", scopeId)) return;
		const ctx = this.ensureScope(scopeId);
		const current = ctx.filtersSubject.value;
		const genres = current.genres || [];
		const updated = genres.includes(genre)
			? genres.filter((g) => g !== genre)
			: [...genres, genre];

		ctx.filtersSubject.next({ ...current, genres: updated });
	}

	/**
	 * Toggle difficulty filter
	 */
	toggleDifficulty(
		difficulty: string,
		scopeId: string = this.defaultScopeId,
	): void {
		if (!this.isEnabled("difficulties", scopeId)) return;
		const ctx = this.ensureScope(scopeId);
		const current = ctx.filtersSubject.value;
		const difficulties = current.difficulties || [];
		const updated = difficulties.includes(difficulty)
			? difficulties.filter((d) => d !== difficulty)
			: [...difficulties, difficulty];

		ctx.filtersSubject.next({ ...current, difficulties: updated });
	}

	/**
	 * Toggle category filter
	 */
	toggleCategory(
		category: string,
		scopeId: string = this.defaultScopeId,
	): void {
		if (!this.isEnabled("categories", scopeId)) return;
		const ctx = this.ensureScope(scopeId);
		const current = ctx.filtersSubject.value;
		const categories = current.categories || [];
		const updated = categories.includes(category)
			? categories.filter((c) => c !== category)
			: [...categories, category];

		ctx.filtersSubject.next({ ...current, categories: updated });
	}

	/**
	 * Toggle version filter
	 */
	toggleVersion(
		version: string,
		scopeId: string = this.defaultScopeId,
	): void {
		if (!this.isEnabled("versions", scopeId)) return;
		const ctx = this.ensureScope(scopeId);
		const current = ctx.filtersSubject.value;
		const versions = current.versions || [];
		const updated = versions.includes(version)
			? versions.filter((v) => v !== version)
			: [...versions, version];

		ctx.filtersSubject.next({ ...current, versions: updated });
	}

	/**
	 * Set multiple filters at once
	 */
	setFilters(
		partial: Partial<WorkshopFilters>,
		scopeId: string = this.defaultScopeId,
	): void {
		const ctx = this.ensureScope(scopeId);
		const current = ctx.filtersSubject.value;
		const allowedPartial = this.pickAllowed(partial, scopeId);
		const updated = WorkshopFiltersSchema.parse({
			...current,
			...allowedPartial,
		});

		ctx.filtersSubject.next(updated);
	}

	/**
	 * Reset all filters to default
	 */
	resetFilters(scopeId: string = this.defaultScopeId): void {
		const ctx = this.ensureScope(scopeId);
		const defaults = WorkshopFiltersSchema.parse({
			...this.getDefaultFilters(),
			...(ctx.config.defaults || {}),
		});
		ctx.filtersSubject.next(defaults);
	}

	/**
	 * Clear specific filters
	 */
	clearFilters(
		keys: (keyof WorkshopFilters)[],
		scopeId: string = this.defaultScopeId,
	): void {
		const ctx = this.ensureScope(scopeId);
		const current = ctx.filtersSubject.value;
		const updated: WorkshopFilters = { ...current };

		keys.forEach((key) => {
			if (!this.isEnabled(key, scopeId)) return;
			if (key === "query") {
				(updated as any)[key] = "";
			} else if (key !== "sortBy") {
				(updated as any)[key] = [];
			}
		});

		ctx.filtersSubject.next(updated);
	}

	/**
	 * Set loading state
	 */
	setLoading(
		isLoading: boolean,
		scopeId: string = this.defaultScopeId,
	): void {
		const ctx = this.ensureScope(scopeId);
		ctx.isLoadingSubject.next(isLoading);
		this.updateState(scopeId);
	}

	/**
	 * Set error
	 */
	setError(
		error: string | null,
		scopeId: string = this.defaultScopeId,
	): void {
		const ctx = this.ensureScope(scopeId);
		ctx.errorSubject.next(error);
		this.updateState(scopeId);
	}

	/**
	 * Check if any filters are active
	 */
	hasActiveFilters(scopeId: string = this.defaultScopeId): boolean {
		const filters = this.ensureScope(scopeId).filtersSubject.value;
		return !!(
			filters.query ||
			filters.genres?.length ||
			filters.difficulties?.length ||
			filters.categories?.length ||
			filters.versions?.length
		);
	}

	/**
	 * Get active filters only
	 */
	getActiveFilters(
		scopeId: string = this.defaultScopeId,
	): Partial<WorkshopFilters> {
		const filters = this.ensureScope(scopeId).filtersSubject.value;
		const active: Partial<WorkshopFilters> = {};

		if (filters.query) active.query = filters.query;
		if (filters.genres?.length) active.genres = filters.genres;
		if (filters.difficulties?.length)
			active.difficulties = filters.difficulties;
		if (filters.categories?.length) active.categories = filters.categories;
		if (filters.versions?.length) active.versions = filters.versions;
		if (filters.sortBy !== DefaultSortOption)
			active.sortBy = filters.sortBy;

		return active;
	}

	getScopeMeta(
		scopeId: string = this.defaultScopeId,
	): FilterContextConfig["meta"] {
		return this.ensureScope(scopeId).config.meta;
	}

	// Helpers
	private isEnabled(key: FilterKey, scopeId: string): boolean {
		const ctx = this.ensureScope(scopeId);
		return ctx.config.enabled.includes(key);
	}

	private pickAllowed(
		partial: Partial<WorkshopFilters>,
		scopeId: string,
	): Partial<WorkshopFilters> {
		const allowedKeys = this.ensureScope(scopeId).config.enabled;
		const result: Partial<WorkshopFilters> = {};
		(Object.keys(partial) as FilterKey[]).forEach((k) => {
			if (allowedKeys.includes(k)) {
				(result as any)[k] = (partial as any)[k];
			}
		});
		return result;
	}
}
