import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable, tap } from "rxjs";

import {
	Chart,
	ChartModel,
	CreateChartModel,
	MutateChartModel,
} from "@/models/chart.model";
import { apiUrl } from ".";
import { CookieService } from "../cookie.service";

@Injectable({
	providedIn: "root",
})
export class ChartService {
	constructor(
		private cookieService: CookieService,
		private http: HttpClient,
	) {}
	private readonly apiUrl = `${apiUrl}/charts`;

	// Caching
	addChartToCache(chart: ChartModel): void {
		const charts = this.cookieService.get("charts");
		const updatedCharts = charts ? [...JSON.parse(charts), chart] : [chart];

		this.cookieService.set("charts", JSON.stringify(updatedCharts));
	}

	removeChartFromCache(id: string): void {
		const charts = this.cookieService.get("charts");

		if (charts) {
			const updatedCharts = JSON.parse(charts).filter(
				(chart: ChartModel) => chart.id !== id,
			);

			this.cookieService.set("charts", JSON.stringify(updatedCharts));
		}
	}

	updateChartInCache(updatedChart: ChartModel): void {
		const charts = this.cookieService.get("charts");

		if (charts) {
			const updatedCharts = JSON.parse(charts).map((chart: ChartModel) =>
				chart.id === updatedChart.id ? updatedChart : chart,
			);

			this.cookieService.set("charts", JSON.stringify(updatedCharts));
		}
	}

	// Create
	async createChart(chart: CreateChartModel): Promise<ChartModel> {
		console.log("Creating chart:", chart);
		return await firstValueFrom(
			this.http.post<ChartModel>(this.apiUrl, chart),
		);
	}

	// Read
	getAllCharts(): Observable<ChartModel[]> {
		const charts = this.cookieService.get("charts");

		if (charts) {
			console.log(`Returning charts from cache...`);

			return new Observable((subscriber) => {
				subscriber.next(JSON.parse(charts));
				subscriber.complete();
			});
		} else {
			console.log(
				"It was not possible to get cached charts. Fetching from API...",
			);

			return this.http.get<ChartModel[]>(this.apiUrl).pipe(
				tap((fetchedCharts) => {
					this.cookieService.set(
						"charts",
						JSON.stringify(fetchedCharts),
					);
				}),
			);
		}
	}

	async getChartById(id: string): Promise<ChartModel> {
		const cacheKey = `chart_${id}`;
		const cachedChart = this.cookieService.get(cacheKey);

		if (cachedChart) {
			console.log(`Returning chart ${id} from cache...`);
			try {
				const chart = JSON.parse(cachedChart);
				return Chart.parse(chart);
			} catch (error) {
				console.error("Error parsing cached chart:", error);
				// Fall back to API fetch if parsing fails.
			}
		}

		console.log("Fetching chart with ID:", id);
		const response = await firstValueFrom(
			this.http.get<unknown>(`${this.apiUrl}/${id}`),
		);

		try {
			const parsedChart = Chart.parse(response);
			this.cookieService.set(cacheKey, JSON.stringify(parsedChart));
			return parsedChart;
		} catch (error) {
			console.error("Invalid data structure received:", error);
			throw new Error("Failed to fetch valid chart data");
		}
	}

	// Update
	async updateChart(
		id: string,
		chart: MutateChartModel,
	): Promise<ChartModel> {
		console.log("Updating chart:", chart);
		return await firstValueFrom(
			this.http.put<ChartModel>(`${this.apiUrl}/${id}`, chart),
		);
	}

	// Delete
	async deleteChart(id: string): Promise<ChartModel> {
		console.log("Deleting chart with ID:", id);
		return await firstValueFrom(
			this.http.delete<ChartModel>(`${this.apiUrl}/${id}`),
		);
	}
}
