import { Router } from "@angular/router";
import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { firstValueFrom, Observable, tap } from "rxjs";

// Services
import { CacheService } from "../cache.service";
import {
	WorkshopFilterService,
	WorkshopFilters,
} from "../workshop-filter.service";

// Models
import {
	Chart,
	ChartModel,
	CreateChartModel,
	MutateChartModel,
} from "@/models/chart.model";

import { apiUrl } from "../../lib/api";

@Injectable({
	providedIn: "root",
})
export class ChartService {
	private router = inject(Router);
	private cacheService = inject(CacheService);
	private http = inject(HttpClient);
	private workshopFilterService = inject(WorkshopFilterService);

	private readonly apiUrl = `${apiUrl}/charts`;

	// Create
	async createChart(chart: CreateChartModel): Promise<ChartModel> {
		console.log("Creating chart:", chart);
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

	// Read
	getCharts(
		forceRefresh: boolean = false,
		hasDeluxe?: boolean,
		genres?: string[],
		difficulties?: string[],
		limit?: number,
		offset?: number,
		isDashboard?: boolean,
	): Observable<ChartModel[]> {
		const charts = this.cacheService.getAllCharts();

		const params: Record<string, string> = {};
		if (typeof limit === "number") params["limit"] = limit.toString();
		if (typeof offset === "number") params["offset"] = offset.toString();
		if (genres && genres.length) params["genres"] = genres.join(",");
		if (difficulties && difficulties.length)
			params["difficulties"] = difficulties.join(",");
		if (typeof hasDeluxe === "boolean")
			params["hasDeluxe"] = hasDeluxe ? "true" : "false";
		if (typeof isDashboard === "boolean")
			params["isDashboard"] = isDashboard ? "true" : "false";

		const queryString = Object.keys(params)
			.map(
				(key) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
			)
			.join("&");

		const url = queryString ? `${this.apiUrl}?${queryString}` : this.apiUrl;

		// Return cached charts if already cached before
		if (forceRefresh || !charts?.length) {
			console.log(
				"It was not possible to get cached charts. Fetching from API...",
			);

			return this.http.get<ChartModel[]>(url).pipe(
				tap((fetchedCharts) => {
					console.log("Fetched charts from API:", fetchedCharts);
					this.cacheService.addCharts(fetchedCharts);
				}),
			);
		} else {
			console.log("Returning cached charts");

			return new Observable((subscriber) => {
				subscriber.next(charts);
				subscriber.complete();
			});
		}
	}

	async getChartById(id: string): Promise<ChartModel> {
		const cachedChart = this.cacheService.getChart(id);

		console.log("Cached chart:", cachedChart);

		if (cachedChart) {
			// If we have a cached chart, we can return it immediately
			try {
				console.log(`Returning chart ${id} from cache...`);
				return Chart.parse(cachedChart);
			} catch (error) {
				console.error("Error parsing cached chart:", error);
				// Fall back to API fetch if parsing fails.
			}
		}

		console.log("Fetching chart with ID:", id);
		const response = await firstValueFrom(this.fetchChartFromRemote(id));

		try {
			const parsedChart = Chart.parse(response);

			// We need to add, since we don't know if it's already cached
			// The user may just pasted the URL in the browser
			this.cacheService.addChart(parsedChart);
			return parsedChart;
		} catch (error) {
			console.error("Error parsing fetched chart:", error);
			throw error;
		}
	}

	searchCharts(): Observable<ChartModel[]> {
		const url = `${this.apiUrl}`;

		return this.http.get<ChartModel[]>(url).pipe(
			tap((fetchedCharts) => {
				/* this.cacheService.addCharts(fetchedCharts); */
			}),
		);
	}

	/**
	 * Search charts with comprehensive filters
	 * Optimized for workshop filtering with all parameters
	 */
	searchChartsWithFilters(
		filters: WorkshopFilters,
		options?: { isDashboard?: boolean },
	): Observable<ChartModel[]> {
		let params = new HttpParams();

		// Add query parameter
		if (filters.query) {
			params = params.set("query", filters.query);
		}

		// Add genre filters
		if (filters.genres && filters.genres.length > 0) {
			params = params.set("genres", filters.genres.join(","));
		}

		// Add difficulty filters
		if (filters.difficulties && filters.difficulties.length > 0) {
			params = params.set("difficulties", filters.difficulties.join(","));
		}

		// Add category filters (map to hasDeluxe if needed)
		if (filters.categories && filters.categories.length > 0) {
			const hasDeluxe = filters.categories.includes("Deluxe");
			params = params.set("hasDeluxe", hasDeluxe.toString());
		}

		// Add version filters
		if (filters.versions && filters.versions.length > 0) {
			params = params.set("versions", filters.versions.join(","));
		}

		// Add sorting
		if (filters.sortBy) {
			params = params.set("sort", filters.sortBy);
		}

		if (options?.isDashboard) {
			params = params.set("isDashboard", "true");
		}

		return this.http.get<ChartModel[]>(this.apiUrl, { params }).pipe(
			tap((fetchedCharts) => {
				console.log("Fetched charts with filters:", {
					filters,
					count: fetchedCharts.length,
				});
				this.cacheService.addCharts(fetchedCharts);
			}),
		);
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
		console.log("Updating chart:", chart);
		const updatedChart = await firstValueFrom(
			this.http.put<ChartModel>(`${this.apiUrl}/${id}`, chart),
		);

		// console.log("Updated chart:", updatedChart);
		this.cacheService.updateChart(updatedChart);

		return updatedChart;
	}

	// Delete
	async deleteChart(id: string): Promise<boolean> {
		console.log("Deleting chart with ID:", id);
		try {
			await firstValueFrom(
				this.http.delete<ChartModel>(`${this.apiUrl}/${id}`),
			);
			this.cacheService.removeChart(id);

			return true;
		} catch (error) {
			console.error("Failed to delete chart:", error);
			return false;
		}
	}
}
