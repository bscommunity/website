import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { firstValueFrom, Observable, of, shareReplay, tap } from "rxjs";

// Services
import { CacheService } from "../cache.service";
import type { STORAGE } from "../cache.service";
import { StorageService } from "../storage.service";
import type { WorkshopFilters } from "../filter.service";

// Models
import {
	Chart,
	ChartModel,
	CreateChartModel,
	MutateChartModel,
} from "@/models/chart.model";

import { apiUrl } from "@/lib/api";
import { SortOption } from "@/models/enums/sort-option.enum";

interface ChartsResponse {
	first: ChartModel[];
	second: number;
}

type CacheScope = "public" | "private";

interface CachedChartsPayload extends ChartsResponse {
	pages?: Record<string, ChartModel[]>;
	total?: number;
	filters?: WorkshopFilters;
	scope?: CacheScope;
	updatedAt?: string;
}

interface CacheScopeStrategy {
	defaultStorage: STORAGE;
	shouldTrackMutations: boolean;
	cacheIndexKey?: string;
}

interface TrackedCacheEntry {
	key: string;
	storage: STORAGE;
}

// Controls how each route scope wants data to be cached by default.
const CACHE_SCOPE_STRATEGIES: Record<CacheScope, CacheScopeStrategy> = {
	public: {
		defaultStorage: "session",
		shouldTrackMutations: false,
	},
	private: {
		defaultStorage: "persistent",
		shouldTrackMutations: true,
		cacheIndexKey: "private_charts_cache_index",
	},
};

@Injectable({
	providedIn: "root",
})
export class ChartService {
	private cacheService = inject(CacheService);
	private storageService = inject(StorageService);
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/charts`;

	// Create
	async createChart(chart: CreateChartModel): Promise<ChartModel> {
		const formData = new FormData();

		// Append the chart data as a JSON string under the "chart" key
		const { chartBundle, ...chartData } = chart;
		formData.append("chart", JSON.stringify(chartData));

		if (chartBundle) {
			// Append the bundle file under the "bundle" key
			formData.append("bundle", chartBundle);
		}

		const createdChart = await firstValueFrom(
			this.http.post<ChartModel>(this.apiUrl, formData),
		);

		this.cacheService.addChart(createdChart);
		this.updateScopedCachesWithChart("private", createdChart);

		return createdChart;
	}

	/**
	 * Generates a cache key based on filters for sessionStorage
	 */
	private generateCacheKey(filters?: WorkshopFilters): string {
		if (!filters) return "charts_default";

		const key = [
			filters.query || "",
			(filters.genres || []).sort().join(","),
			(filters.difficulties || []).sort().join(","),
			(filters.categories || []).sort().join(","),
			(filters.versions || []).sort().join(","),
			filters.sortBy || "",
		].join("|");

		return `charts_${encodeURIComponent(key)}`;
	}

	// Read
	getCharts(
		filters?: WorkshopFilters,
		options?: {
			limit?: number;
			offset?: number;
			isDashboard?: boolean;
			disableCache?: boolean;
			storage?: STORAGE;
		},
	): Observable<ChartsResponse> {
		const isDefaultQuery = this.cacheService.isDefaultFilters(filters);
		const isDashboardRequest = options?.isDashboard ?? false;
		// Public (workshop) and private (dashboard) screens decide caching very differently.
		const cacheScope: CacheScope = isDashboardRequest
			? "private"
			: "public";
		const scopeStrategy = CACHE_SCOPE_STRATEGIES[cacheScope];
		const defaultStorage = scopeStrategy?.defaultStorage ?? "session";
		// Callers can override storage, but otherwise we follow the scope strategy
		// and keep the default landing query in persistent storage as before.
		const storageType: STORAGE =
			options?.storage ??
			(cacheScope === "public" && isDefaultQuery
				? "persistent"
				: defaultStorage);
		const baseCacheKey = this.generateCacheKey(filters);
		const cacheKey =
			cacheScope === "public"
				? baseCacheKey
				: `${baseCacheKey}_${cacheScope}`;
		const canReadCache = !options?.disableCache;
		const isPaginated = Boolean(options?.limit);
		const pageKey =
			isPaginated && options?.limit
				? `${options.limit}:${options.offset || 0}`
				: undefined;

		if (canReadCache) {
			if (
				!isPaginated &&
				cacheScope === "public" &&
				storageType === "persistent" &&
				isDefaultQuery
			) {
				const cachedDefault = this.cacheService.getDefaultChartsCache();
				if (
					cachedDefault?.charts?.length &&
					this.cacheService.isDefaultCacheValid()
				) {
					return of({
						first: cachedDefault.charts,
						second: cachedDefault.total,
					});
				}
			} else {
				const cachedPayload = this.getStoredChartsCache(
					cacheKey,
					storageType,
				);

				if (cachedPayload) {
					if (isPaginated && pageKey) {
						const cachedPage = cachedPayload.pages?.[pageKey];
						if (cachedPage) {
							return of({
								first: cachedPage,
								second: this.getCachedTotal(cachedPayload),
							});
						}
					} else {
						return of({
							first: cachedPayload.first,
							second: this.getCachedTotal(cachedPayload),
						});
					}
				}
			}
		}

		let params = new HttpParams().set("count", "true");

		if (filters?.query) {
			params = params.set("query", filters.query);
		}

		if (filters?.genres && filters?.genres.length > 0) {
			params = params.set("genres", filters.genres.join(","));
		}

		if (filters?.difficulties && filters?.difficulties.length > 0) {
			params = params.set("difficulties", filters.difficulties.join(","));
		}

		if (filters?.categories && filters?.categories.length > 0) {
			const hasDeluxe = filters.categories.includes("Deluxe");
			params = params.set("hasDeluxe", hasDeluxe.toString());
		}

		if (filters?.versions && filters?.versions.length > 0) {
			params = params.set("versions", filters.versions.join(","));
		}

		if (filters?.sortBy) {
			params = params.set("sortBy", filters.sortBy);
		}

		if (options?.limit)
			params = params.set("limit", options.limit.toString());
		if (options?.offset)
			params = params.set("offset", options.offset.toString());
		if (options?.isDashboard) {
			params = params.set("isDashboard", "true");
		}

		return this.http.get<ChartsResponse>(this.apiUrl, { params }).pipe(
			tap((fetchedCharts) => {
				console.log("Fetched charts from API:", fetchedCharts);
				if (!isPaginated) {
					if (
						cacheScope === "public" &&
						storageType === "persistent" &&
						isDefaultQuery
					) {
						this.cacheService.setDefaultChartsCache(
							fetchedCharts.first,
							fetchedCharts.second,
						);
						this.cacheService.setDefaultCacheMetadata(filters);
					} else {
						this.persistChartsCache(
							cacheKey,
							fetchedCharts,
							storageType,
							cacheScope,
							filters,
						);
					}
				} else if (pageKey) {
					this.persistPaginatedChartsCache(
						cacheKey,
						fetchedCharts,
						pageKey,
						storageType,
						cacheScope,
						filters,
					);
				}

				if (cacheScope === "public") {
					this.cacheService.addCharts(
						fetchedCharts.first,
						storageType,
					);
				}
			}),
			shareReplay({ bufferSize: 1, refCount: true }),
		);
	}

	async getChartById(id: string): Promise<ChartModel> {
		const cachedChart = this.cacheService.getChart(id);

		if (cachedChart) {
			// If we have a cached chart, we can return it immediately
			try {
				return Chart.parse(cachedChart);
			} catch (error) {
				console.error(
					"Failed to parse cached chart, fetching from remote:",
					error,
				);
				// Fall back to API fetch if parsing fails.
			}
		}

		const response = await firstValueFrom(this.fetchChartFromRemote(id));
		console.log("Fetched chart from API:", response);

		const parsedChart = Chart.parse(response);

		// We need to add, since we don't know if it's already cached
		// The user may just pasted the URL in the browser
		this.cacheService.addChart(parsedChart);
		return parsedChart;
	}

	getSuggestions(query: string): Observable<string[]> {
		const url = `${this.apiUrl}/suggestions?query=${query}`;

		return this.http.get<string[]>(url);
	}

	fetchChartFromRemote(id: string): Observable<ChartModel> {
		return this.http.get<ChartModel>(`${this.apiUrl}/${id}`);
	}

	// Update
	async updateChart(
		id: string,
		chart: MutateChartModel,
	): Promise<ChartModel> {
		const updatedChart = await firstValueFrom(
			this.http.put<ChartModel>(`${this.apiUrl}/${id}`, chart),
		);

		this.cacheService.updateChart(updatedChart);
		this.updateScopedCachesWithChart("private", updatedChart);

		return updatedChart;
	}

	// Delete
	async deleteChart(id: string): Promise<boolean> {
		try {
			await firstValueFrom(
				this.http.delete<ChartModel>(`${this.apiUrl}/${id}`),
			);
			this.cacheService.removeChart(id);
			this.removeChartFromScopedCaches("private", id);

			return true;
		} catch (error) {
			console.error("Error deleting chart:", error);
			return false;
		}
	}

	// Cache storage now only understands the current payload format; any mismatched
	// structures are discarded to avoid carrying legacy assumptions forward.
	private getStoredChartsCache(
		key: string,
		storage: STORAGE,
	): CachedChartsPayload | null {
		const raw = this.storageService.getItem(key, storage === "session");
		if (!raw) {
			return null;
		}

		try {
			const parsed = JSON.parse(raw);
			if (
				parsed &&
				typeof parsed === "object" &&
				Array.isArray(parsed.first) &&
				typeof parsed.second === "number"
			) {
				if (parsed.pages) {
					Object.keys(parsed.pages).forEach((pageKey) => {
						if (!Array.isArray(parsed.pages[pageKey])) {
							delete parsed.pages[pageKey];
						}
					});
				}
				return parsed as CachedChartsPayload;
			}
		} catch (error) {
			console.error("Failed to parse charts cache payload:", error);
			this.storageService.removeItem(key, storage === "session");
		}

		return null;
	}

	private persistChartsCache(
		key: string,
		response: ChartsResponse,
		storage: STORAGE,
		scope: CacheScope,
		filters?: WorkshopFilters,
	): void {
		// Non-paginated caches only need the latest batch plus metadata.
		const payload: CachedChartsPayload = {
			first: response.first,
			second: response.second,
			filters,
			scope,
			updatedAt: new Date().toISOString(),
		};

		this.storageService.setItem(
			key,
			JSON.stringify(payload),
			storage === "session",
		);

		this.trackScopedCacheEntry(scope, { key, storage });
	}

	private persistPaginatedChartsCache(
		key: string,
		response: ChartsResponse,
		pageKey: string,
		storage: STORAGE,
		scope: CacheScope,
		filters?: WorkshopFilters,
	): void {
		const existing =
			this.getStoredChartsCache(key, storage) ||
			({} as CachedChartsPayload);
		const pages = existing.pages ? { ...existing.pages } : {};
		pages[pageKey] = response.first;

		const payload: CachedChartsPayload = {
			...existing,
			first: response.first,
			second: response.second,
			pages,
			filters,
			scope,
			updatedAt: new Date().toISOString(),
		};

		this.storageService.setItem(
			key,
			JSON.stringify(payload),
			storage === "session",
		);

		this.trackScopedCacheEntry(scope, { key, storage });
	}

	private getCachedTotal(payload: CachedChartsPayload): number {
		if (typeof payload.second === "number") {
			return payload.second;
		}
		if (typeof payload.total === "number") {
			return payload.total;
		}
		return payload.first.length;
	}

	// Synchronize any tracked caches for a scope after create/update operations.
	private updateScopedCachesWithChart(
		scope: CacheScope,
		chart: ChartModel,
	): void {
		this.mutateTrackedCaches(scope, (payload) => {
			if (!this.chartMatchesFilters(chart, payload.filters)) {
				const filtered = payload.first.filter(
					(entry) => entry.id !== chart.id,
				);
				if (filtered.length === payload.first.length) {
					return payload;
				}
				payload.first = filtered;
				payload.second = payload.first.length;
				return payload;
			}

			const existingIndex = payload.first.findIndex(
				(current) => current.id === chart.id,
			);

			if (existingIndex >= 0) {
				payload.first[existingIndex] = chart;
			} else {
				payload.first.unshift(chart);
			}

			this.sortChartsByOption(payload.first, payload.filters?.sortBy);
			payload.second = payload.first.length;
			return payload;
		});
	}

	// Drop a chart from any cached pages for the given scope after deletion.
	private removeChartFromScopedCaches(scope: CacheScope, id: string): void {
		this.mutateTrackedCaches(scope, (payload) => {
			const nextCharts = payload.first.filter((chart) => chart.id !== id);
			if (nextCharts.length === payload.first.length) {
				return payload;
			}

			payload.first = nextCharts;
			payload.second = payload.first.length;
			if (payload.pages) {
				Object.keys(payload.pages).forEach((page) => {
					payload.pages![page] = payload.pages![page].filter(
						(chart) => chart.id !== id,
					);
				});
			}

			return payload;
		});
	}

	// Utility used by create/update/delete flows to tweak cached payloads in place.
	private mutateTrackedCaches(
		scope: CacheScope,
		mutator: (payload: CachedChartsPayload) => CachedChartsPayload | null,
	): void {
		if (!this.scopeSupportsTracking(scope)) {
			return;
		}

		const entries = this.getTrackedCacheEntries(scope);
		if (!entries.length) {
			return;
		}

		const remainingEntries: TrackedCacheEntry[] = [];
		entries.forEach((entry) => {
			const payload = this.getStoredChartsCache(entry.key, entry.storage);
			if (!payload || (payload.scope && payload.scope !== scope)) {
				return;
			}

			const sourcePages = payload.pages;
			const clonedPayload: CachedChartsPayload = {
				...payload,
				first: [...payload.first],
				pages: sourcePages
					? Object.keys(sourcePages).reduce(
							(acc, page) => {
								acc[page] = [...sourcePages[page]];
								return acc;
							},
							{} as Record<string, ChartModel[]>,
						)
					: undefined,
			};

			const result = mutator(clonedPayload);
			if (!result) {
				this.storageService.removeItem(
					entry.key,
					entry.storage === "session",
				);
				return;
			}

			result.scope = scope;
			result.updatedAt = new Date().toISOString();
			this.storageService.setItem(
				entry.key,
				JSON.stringify(result),
				entry.storage === "session",
			);
			remainingEntries.push(entry);
		});

		this.saveTrackedCacheEntries(scope, remainingEntries);
	}

	// Keeps a lightweight index of which cache keys should be mutated later.
	private trackScopedCacheEntry(
		scope: CacheScope,
		entry: TrackedCacheEntry,
	): void {
		if (!this.scopeSupportsTracking(scope)) {
			return;
		}

		const entries = this.getTrackedCacheEntries(scope);
		const alreadyTracked = entries.some(
			(current) =>
				current.key === entry.key && current.storage === entry.storage,
		);
		if (alreadyTracked) {
			return;
		}

		entries.push(entry);
		this.saveTrackedCacheEntries(scope, entries);
	}

	// Tracked cache entries are always stored using the typed metadata shape above.
	private getTrackedCacheEntries(scope: CacheScope): TrackedCacheEntry[] {
		const indexKey = this.getScopeIndexKey(scope);
		if (!indexKey) {
			return [];
		}

		const stored = this.storageService.getItem(indexKey);
		if (!stored) {
			return [];
		}

		try {
			const parsed = JSON.parse(stored);
			if (Array.isArray(parsed)) {
				return parsed.filter((entry) =>
					this.isValidTrackedEntry(entry),
				);
			}
		} catch {
			this.storageService.removeItem(indexKey);
		}

		return [];
	}

	private saveTrackedCacheEntries(
		scope: CacheScope,
		entries: TrackedCacheEntry[],
	): void {
		const indexKey = this.getScopeIndexKey(scope);
		if (!indexKey) {
			return;
		}

		const uniqueEntries = entries.reduce<TrackedCacheEntry[]>(
			(collection, entry) => {
				if (!this.isValidTrackedEntry(entry)) {
					return collection;
				}

				const alreadyTracked = collection.some(
					(saved) =>
						saved.key === entry.key &&
						saved.storage === entry.storage,
				);
				if (!alreadyTracked) {
					collection.push(entry);
				}
				return collection;
			},
			[],
		);

		if (!uniqueEntries.length) {
			this.storageService.removeItem(indexKey);
			return;
		}

		this.storageService.setItem(indexKey, JSON.stringify(uniqueEntries));
	}

	// Only scopes that opt-in should incur the bookkeeping overhead.
	private scopeSupportsTracking(scope: CacheScope): boolean {
		return Boolean(CACHE_SCOPE_STRATEGIES[scope]?.shouldTrackMutations);
	}

	private getScopeIndexKey(scope: CacheScope): string | undefined {
		return CACHE_SCOPE_STRATEGIES[scope]?.cacheIndexKey;
	}

	private isValidTrackedEntry(entry: unknown): entry is TrackedCacheEntry {
		return (
			Boolean(entry) &&
			typeof entry === "object" &&
			typeof (entry as TrackedCacheEntry).key === "string" &&
			((entry as TrackedCacheEntry).storage === "session" ||
				(entry as TrackedCacheEntry).storage === "persistent")
		);
	}

	private chartMatchesFilters(
		chart: ChartModel,
		filters?: WorkshopFilters,
	): boolean {
		if (!filters) {
			return true;
		}

		const normalizedQuery = filters.query?.trim().toLowerCase();
		if (normalizedQuery) {
			const haystack = `${chart.artist} ${chart.track}`.toLowerCase();
			if (!haystack.includes(normalizedQuery)) {
				return false;
			}
		}

		if (filters.genres?.length) {
			if (!chart.genre || !filters.genres.includes(chart.genre)) {
				return false;
			}
		}

		if (filters.difficulties?.length) {
			const difficultySet = new Set(filters.difficulties);
			const matchesDifficulty = chart.versions?.some((version) =>
				difficultySet.has(version.difficulty),
			);
			if (!matchesDifficulty) {
				return false;
			}
		}

		const wantsDeluxe = Boolean(
			filters.versions?.includes("Deluxe") ||
			filters.categories?.includes("Deluxe"),
		);
		if (wantsDeluxe) {
			const hasDeluxe = chart.versions?.some(
				(version) => version.isDeluxe,
			);
			if (!hasDeluxe) {
				return false;
			}
		}

		return true;
	}

	private sortChartsByOption(
		charts: ChartModel[],
		sortBy?: SortOption,
	): void {
		switch (sortBy) {
			case SortOption.LAST_UPDATED:
				charts.sort(
					(a, b) =>
						this.toTimestamp(b.updatedAt) -
						this.toTimestamp(a.updatedAt),
				);
				break;
			case SortOption.MOST_DOWNLOADED:
				charts.sort(
					(a, b) =>
						(b.latestVersion?.downloadsAmount ?? 0) -
						(a.latestVersion?.downloadsAmount ?? 0),
				);
				break;
			default:
				break;
		}
	}

	private toTimestamp(value?: string | Date): number {
		if (!value) {
			return 0;
		}
		return new Date(value).getTime();
	}
}
