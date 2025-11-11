import { Router } from "@angular/router";
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable, tap } from "rxjs";

// Services
import { CacheService } from "../cache.service";

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
	getCharts(forceRefresh: boolean = false, limit?: number, offset?: number): Observable<ChartModel[]> {
		const charts = this.cacheService.getAllCharts();
		const url = `${this.apiUrl}${limit ? `?limit=${limit}` : ""}${offset ? `${limit ? "&" : "?"}offset=${offset}` : ""
			}`;

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

	searchCharts(query: string): Observable<ChartModel[]> {
		const url = `${this.apiUrl}?query=${query}`;

		return this.http.get<ChartModel[]>(url).pipe(
			tap((fetchedCharts) => {
				/* this.cacheService.addCharts(fetchedCharts); */
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
