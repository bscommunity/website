import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom, type Observable, of, map, shareReplay, tap } from "rxjs";
import { apiUrl } from "@/lib/api";
import {
	Chart,
	type ChartModel,
	type MutateChartModel,
} from "@/models/chart.model";
import type { Difficulty } from "@/models/enums/difficulty.enum";
import type { Genre } from "@/models/enums/genre.enum";
import type { StreamingLinkModel } from "@/models/streaming-link.model";
import type { SimplifiedContributorModel } from "@/models/contributor.model";
import type { QueryPage, STORAGE } from "../cache.service";
import { CacheService } from "../cache.service";
import type { WorkshopFilters } from "../filter.service";

export interface CreateChartPayload {
	artist: string;
	track: string;
	album: string | null;
	trackUrls: StreamingLinkModel[];
	previewUrl?: string | null;
	trackPreviewUrl?: string | null;
	coverUrl?: string | null;
	genre?: Genre | null;
	isExplicit: boolean;
	duration: number;
	notesAmount: number;
	effectsAmount: number;
	bpm?: number | null;
	difficulty: Difficulty;
	isDeluxe: boolean;
	bundleUrl?: string;
	fileSizeBytes?: number;
	chartBundle?: File;
	contributors?: SimplifiedContributorModel[];
}

type CacheScope = "public" | "private";

@Injectable({
	providedIn: "root",
})
export class ChartService {
	private cacheService = inject(CacheService);
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/charts`;

	// Create
	async createChart(chart: CreateChartPayload, publishSessionId?: string): Promise<ChartModel> {
		const formData = new FormData();

		// Append the chart data as a JSON string under the "chart" key
		const { chartBundle, ...chartData } = chart;
		formData.append("chart", JSON.stringify(chartData));

		if (chartBundle) {
			// Append the bundle file under the "bundle" key
			formData.append("bundle", chartBundle);
		}

		const headers: Record<string, string> = {};
		if (publishSessionId) {
			headers["X-Publish-Session-Id"] = publishSessionId;
		}

		const createdChart = Chart.parse(
			await firstValueFrom(
				this.http.post<ChartModel>(this.apiUrl, formData, { headers }),
			),
		);

		this.cacheService.upsertEntities("chart", [createdChart]);
		this.cacheService.insertIntoQueryResults("chart", createdChart);
		this.cacheService.insertIntoQueryResults("upload", createdChart);

		return createdChart;
	}

	buildChartData(chart: CreateChartPayload, publishSessionId?: string): { formData: FormData; headers: Record<string, string> } {
		const formData = new FormData();
		const { chartBundle, ...chartData } = chart;
		formData.append("chart", JSON.stringify(chartData));

		if (chartBundle) {
			formData.append("bundle", chartBundle);
		}

		const headers: Record<string, string> = {};
		if (publishSessionId) {
			headers["X-Publish-Session-Id"] = publishSessionId;
		}

		return { formData, headers };
	}

	get apiUrlRef(): string {
		return this.apiUrl;
	}

	addChartToCache(chart: ChartModel): void {
		this.cacheService.upsertEntities("chart", [chart]);
		this.cacheService.insertIntoQueryResults("chart", chart);
		this.cacheService.insertIntoQueryResults("upload", chart);
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
			count?: boolean;
			myCharts?: boolean;
		},
	): Observable<QueryPage<ChartModel>> {
		const isDashboardRequest = options?.isDashboard ?? false;
		const cacheScope: CacheScope = isDashboardRequest ? "private" : "public";
		const cacheType = cacheScope === "private" ? "chart:dashboard" : "chart:workshop";
		const cacheStorage: STORAGE =
			options?.storage ?? (cacheScope === "public" ? "session" : "persistent");
		const cacheKey = this.generateCacheKey(filters);
		const canReadCache = !options?.disableCache;
		const isPaginated = Boolean(options?.limit);
		const pageKey =
			isPaginated && options?.limit
				? `${options.limit}:${options.offset || 0}`
				: undefined;

		if (canReadCache) {
			const cachedPayload = this.cacheService.getQuery<ChartModel>(cacheType, cacheKey, cacheStorage);

			if (cachedPayload) {
				return of(cachedPayload);
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

		if (options?.limit) params = params.set("limit", options.limit.toString());
		if (options?.offset)
			params = params.set("offset", options.offset.toString());
		if (options?.isDashboard) {
			params = params.set("isDashboard", "true");
		}
		if (options?.count) {
			params = params.set("count", "true");
		}
		if (options?.myCharts) {
			params = params.set("myCharts", "true");
		}

		return this.http.get<{ first: ChartModel[]; second: number }>(this.apiUrl, { params }).pipe(
			map((res) => ({ items: res.first, total: res.second })),
			tap((page) => {
				if (!isPaginated) {
					this.cacheService.setQuery(cacheType, cacheKey, page, cacheStorage, 30_000);
				} else {
					this.cacheService.setQuery(cacheType, `${cacheKey}|page=${pageKey}`, page, cacheStorage, 30_000);
				}
				this.cacheService.upsertEntities("chart", page.items);
			}),
			shareReplay({ bufferSize: 1, refCount: true }),
		);
	}

	async getChartById(id: string): Promise<ChartModel> {
		const cachedChart = this.cacheService.getEntity<ChartModel>("chart", id);

		if (cachedChart) {
			try {
				return Chart.parse(cachedChart);
			} catch (error) {
				console.error(
					"Failed to parse cached chart, fetching from remote:",
					error,
				);
			}
		}

		const response = await firstValueFrom(this.fetchChartFromRemote(id));
		console.log("Fetched chart from API:", response);

		const parsedChart = Chart.parse(response);

		this.cacheService.upsertEntities("chart", [parsedChart]);
		return parsedChart;
	}

	getSuggestions(query: string): Observable<string[]> {
		const url = `${this.apiUrl}/suggestions?query=${query}`;

		return this.http.get<string[]>(url);
	}

	fetchChartFromRemote(id: string): Observable<ChartModel> {
		return this.http.get<ChartModel>(`${this.apiUrl}/${id}`);
	}

	async getBundleUrl(id: string): Promise<string> {
		const response = await firstValueFrom(
			this.http.get<{ url: string }>(`${this.apiUrl}/${id}/bundle`),
		);
		return response.url;
	}

	// Update
	async updateChart(id: string, chart: MutateChartModel): Promise<ChartModel> {
		const updatedChart = await firstValueFrom(
			this.http.put<ChartModel>(`${this.apiUrl}/${id}`, chart),
		);

		this.cacheService.upsertEntities("chart", [updatedChart]);

		return updatedChart;
	}

	// Delete
	async deleteChart(id: string): Promise<boolean> {
		try {
			await firstValueFrom(
				this.http.delete<ChartModel>(`${this.apiUrl}/${id}`),
			);
			this.cacheService.removeEntity("chart", id);
			this.cacheService.removeFromQueryResults("chart", id);
			this.cacheService.removeFromQueryResults("upload", id);

			return true;
		} catch (error) {
			console.error("Error deleting chart:", error);
			return false;
		}
	}


}
