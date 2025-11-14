import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { firstValueFrom, Observable, shareReplay, tap } from "rxjs";

// Services
import { CacheService } from "../cache.service";
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

interface ChartsResponse {
	first: ChartModel[];
	second: number;
}

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

		return await firstValueFrom(
			this.http.post<ChartModel>(this.apiUrl, formData),
		);
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
			storage?: "persistent" | "session";
		},
	): Observable<ChartsResponse> {
		const isDefaultQuery = this.cacheService.isDefaultFilters(filters);
		const cacheKey = this.generateCacheKey(filters);

		// Check if we should use cache
		let shouldUseCache = false;
		let storageType: "persistent" | "session" =
			options?.storage || "persistent";

		if (!options?.disableCache) {
			if (isDefaultQuery) {
				// For default queries, use persistent cache with 4-hour validity
				shouldUseCache = this.cacheService.isDefaultCacheValid();
				storageType = "persistent";
				console.log(`Default query - cache valid: ${shouldUseCache}`);
			} else {
				// For filtered queries, check sessionStorage for this specific filter combination
				const sessionData = this.storageService.getItem(cacheKey, true);
				shouldUseCache = !!sessionData;
				storageType = "session";
				console.log(
					`Filtered query - session cache exists: ${shouldUseCache}`,
				);
			}
		}

		console.log(
			`Fetching charts with filters:`,
			filters,
			`| Using cache: ${shouldUseCache} (storage: ${storageType})`,
			options,
		);

		// Return cached data if available and valid
		// 1) Paginated requests: try per-page cache in sessionStorage
		if (options?.limit) {
			const pageKey = `${options.limit}:${options.offset || 0}`;
			const sessionData = this.storageService.getItem(cacheKey, true);
			if (sessionData) {
				try {
					const parsed = JSON.parse(sessionData);
					const pages = (parsed?.pages || {}) as Record<
						string,
						ChartModel[]
					>;
					const total: number =
						typeof parsed?.total === "number"
							? parsed.total
							: typeof parsed?.second === "number"
								? parsed.second
								: Array.isArray(parsed?.first)
									? (parsed.first as ChartModel[]).length
									: 0;

					if (Array.isArray(pages[pageKey])) {
						console.log(
							`Returning page ${pageKey} from session cache (filtered/default query)`,
						);
						return new Observable((subscriber) => {
							subscriber.next({
								first: pages[pageKey],
								second: total,
							});
							subscriber.complete();
						});
					}
				} catch (error) {
					console.error(
						"Failed to parse paginated session cache:",
						error,
					);
				}
			}
		}

		// 2) Non-paginated: reuse existing cache strategy
		if (shouldUseCache && !options?.limit) {
			if (isDefaultQuery) {
				const cachedDefault = this.cacheService.getDefaultChartsCache();
				if (cachedDefault?.charts?.length) {
					console.log(
						`Returning ${cachedDefault.charts.length} charts from persistent cache (default query)`,
					);
					return new Observable((subscriber) => {
						subscriber.next({
							first: cachedDefault.charts,
							second: cachedDefault.total,
						});
						subscriber.complete();
					});
				}
			} else {
				const sessionData = this.storageService.getItem(cacheKey, true);
				if (sessionData) {
					try {
						const parsed = JSON.parse(sessionData);
						// Support legacy cache (array only) and new shape ({ first, second })
						const charts = Array.isArray(parsed)
							? (parsed as ChartModel[])
							: ((parsed?.first || []) as ChartModel[]);
						const total = Array.isArray(parsed)
							? charts.length
							: typeof parsed?.second === "number"
								? (parsed.second as number)
								: charts.length;
						console.log(
							`Returning ${charts.length} charts from session cache (filtered query)`,
						);
						return new Observable((subscriber) => {
							subscriber.next({
								first: charts,
								second: total,
							});
							subscriber.complete();
						});
					} catch (error) {
						console.error("Failed to parse session cache:", error);
					}
				}
			}
		}

		// Build HTTP params
		let params = new HttpParams();

		// Add query parameter
		if (filters?.query) {
			params = params.set("query", filters.query);
		}

		// Add genre filters
		if (filters?.genres && filters?.genres.length > 0) {
			params = params.set("genres", filters.genres.join(","));
		}

		// Add difficulty filters
		if (filters?.difficulties && filters?.difficulties.length > 0) {
			params = params.set("difficulties", filters.difficulties.join(","));
		}

		// Add category filters (map to hasDeluxe if needed)
		if (filters?.categories && filters?.categories.length > 0) {
			const hasDeluxe = filters.categories.includes("Deluxe");
			params = params.set("hasDeluxe", hasDeluxe.toString());
		}

		// Add version filters
		if (filters?.versions && filters?.versions.length > 0) {
			params = params.set("versions", filters.versions.join(","));
		}

		// Add sorting
		if (filters?.sortBy) {
			params = params.set("sortBy", filters.sortBy);
		}

		// Add options
		if (options?.limit)
			params = params.set("limit", options.limit.toString());
		if (options?.offset)
			params = params.set("offset", options.offset.toString());
		if (options?.isDashboard) params = params.set("isDashboard", "true");

		// Fetch from remote API
		console.log("Fetching charts from remote API with filters:", filters);
		return this.http.get<ChartsResponse>(this.apiUrl, { params }).pipe(
			tap((fetchedCharts) => {
				console.log(
					`Fetched ${fetchedCharts.first.length} charts from API`,
				);

				if (!options?.limit) {
					if (isDefaultQuery) {
						// Store default data in persistent storage with metadata
						console.log(
							"Caching default charts to persistent storage",
						);
						this.cacheService.setDefaultChartsCache(
							fetchedCharts.first,
							fetchedCharts.second,
						);
						this.cacheService.addCharts(
							fetchedCharts.first,
							"persistent",
						);
						this.cacheService.setDefaultCacheMetadata(filters);
					} else {
						// Store filtered data in sessionStorage with specific key
						console.log(
							`Caching filtered charts to session storage (key: ${cacheKey})`,
						);
						// When not paginating, we still store a minimal object for compatibility
						this.storageService.setItem(
							cacheKey,
							JSON.stringify({
								first: fetchedCharts.first,
								second: fetchedCharts.second,
								updatedAt: new Date().toISOString(),
							}),
							true, // use sessionStorage
						);
					}
				}

				// Always update per-page cache in session when paginating
				if (options?.limit) {
					const pageKey = `${options.limit}:${options.offset || 0}`;
					const sessionData = this.storageService.getItem(
						cacheKey,
						true,
					);
					let parsed: any = {};
					try {
						parsed = sessionData ? JSON.parse(sessionData) : {};
					} catch {
						parsed = {};
					}
					parsed.pages = parsed.pages || {};
					parsed.pages[pageKey] = fetchedCharts.first;
					parsed.total = fetchedCharts.second;
					parsed.updatedAt = new Date().toISOString();
					this.storageService.setItem(
						cacheKey,
						JSON.stringify(parsed),
						true,
					);

					// Optionally keep individual charts fresh in persistent cache for quick detail views
					try {
						this.cacheService.addCharts(
							fetchedCharts.first,
							"persistent",
						);
					} catch {}
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
				// Fall back to API fetch if parsing fails.
			}
		}

		const response = await firstValueFrom(this.fetchChartFromRemote(id));

		try {
			const parsedChart = Chart.parse(response);

			// We need to add, since we don't know if it's already cached
			// The user may just pasted the URL in the browser
			this.cacheService.addChart(parsedChart);
			return parsedChart;
		} catch (error) {
			throw error;
		}
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

		return updatedChart;
	}

	// Delete
	async deleteChart(id: string): Promise<boolean> {
		try {
			await firstValueFrom(
				this.http.delete<ChartModel>(`${this.apiUrl}/${id}`),
			);
			this.cacheService.removeChart(id);

			return true;
		} catch (error) {
			return false;
		}
	}
}
