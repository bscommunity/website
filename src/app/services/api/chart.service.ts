import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { firstValueFrom, Observable, shareReplay, tap } from "rxjs";

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

type CacheScope = "public" | "uploads";

interface CachedChartsPayload extends ChartsResponse {
	pages?: Record<string, ChartModel[]>;
	total?: number;
	filters?: WorkshopFilters;
	scope?: CacheScope;
	updatedAt?: string;
}

@Injectable({
	providedIn: "root",
})
export class ChartService {
	private cacheService = inject(CacheService);
	private storageService = inject(StorageService);
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/charts`;
	private readonly uploadsCacheIndexKey = "uploads_cache_index";

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
		this.updateUploadsCachesWithChart(createdChart);

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

		return `charts_${btoa(key)}`;
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

		const storageType: STORAGE =
			options?.storage ??
			(isDashboardRequest
				? "persistent"
				: isDefaultQuery
					? "persistent"
					: "session");

		const cacheScope: CacheScope = isDashboardRequest
			? "uploads"
			: "public";
		const baseCacheKey = this.generateCacheKey(filters);
		const cacheKey =
			cacheScope === "uploads" ? `${baseCacheKey}_uploads` : baseCacheKey;
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
					return new Observable((subscriber) => {
						subscriber.next({
							first: cachedDefault.charts,
							second: cachedDefault.total,
						});
						subscriber.complete();
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
							return new Observable((subscriber) => {
								subscriber.next({
									first: cachedPage,
									second: this.getCachedTotal(cachedPayload),
								});
								subscriber.complete();
							});
						}
					} else {
						return new Observable((subscriber) => {
							subscriber.next({
								first: cachedPayload.first,
								second: this.getCachedTotal(cachedPayload),
							});
							subscriber.complete();
						});
					}
				}
			}
		}

		let params = new HttpParams();

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
						"persistent",
					);
				}
			}),
			shareReplay(1),
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
		this.updateUploadsCachesWithChart(updatedChart);

		return updatedChart;
	}

	// Delete
	async deleteChart(id: string): Promise<boolean> {
		try {
			await firstValueFrom(
				this.http.delete<ChartModel>(`${this.apiUrl}/${id}`),
			);
			this.cacheService.removeChart(id);
			this.removeChartFromUploadsCaches(id);

			return true;
		} catch (error) {
			console.error("Error deleting chart:", error);
			return false;
		}
	}

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
			if (Array.isArray(parsed)) {
				return {
					first: parsed as ChartModel[],
					second: parsed.length,
				};
			}

			if (
				parsed &&
				typeof parsed === "object" &&
				Array.isArray(parsed.first) &&
				typeof parsed.second === "number"
			) {
				return parsed as CachedChartsPayload;
			}

			if (
				parsed &&
				typeof parsed === "object" &&
				Array.isArray(parsed.charts) &&
				typeof parsed.total === "number"
			) {
				return {
					first: parsed.charts as ChartModel[],
					second: parsed.total as number,
					filters: parsed.filters,
					scope: parsed.scope,
					updatedAt: parsed.updatedAt,
				};
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

		if (scope === "uploads") {
			this.trackUploadsCacheKey(key);
		}
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

		if (scope === "uploads") {
			this.trackUploadsCacheKey(key);
		}
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

	private trackUploadsCacheKey(key: string): void {
		const keys = this.getUploadsCacheKeys();
		if (keys.includes(key)) {
			return;
		}
		keys.push(key);
		this.saveUploadsCacheKeys(keys);
	}

	private getUploadsCacheKeys(): string[] {
		const stored = this.storageService.getItem(this.uploadsCacheIndexKey);
		if (!stored) {
			return [];
		}

		try {
			const parsed = JSON.parse(stored);
			return Array.isArray(parsed) ? (parsed as string[]) : [];
		} catch {
			return [];
		}
	}

	private saveUploadsCacheKeys(keys: string[]): void {
		this.storageService.setItem(
			this.uploadsCacheIndexKey,
			JSON.stringify(keys),
		);
	}

	private updateUploadsCachesWithChart(chart: ChartModel): void {
		this.mutateUploadsCaches((payload) => {
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

	private removeChartFromUploadsCaches(id: string): void {
		this.mutateUploadsCaches((payload) => {
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

	private mutateUploadsCaches(
		mutator: (payload: CachedChartsPayload) => CachedChartsPayload | null,
	): void {
		const keys = this.getUploadsCacheKeys();
		if (!keys.length) {
			return;
		}

		const remainingKeys: string[] = [];
		keys.forEach((key) => {
			const payload = this.getStoredChartsCache(key, "persistent");
			if (!payload || (payload.scope && payload.scope !== "uploads")) {
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
				this.storageService.removeItem(key);
				return;
			}

			result.scope = "uploads";
			result.updatedAt = new Date().toISOString();
			this.storageService.setItem(key, JSON.stringify(result), false);
			remainingKeys.push(key);
		});

		this.saveUploadsCacheKeys(remainingKeys);
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
						this.toTimestamp(b.latestVersion?.publishedAt) -
						this.toTimestamp(a.latestVersion?.publishedAt),
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
