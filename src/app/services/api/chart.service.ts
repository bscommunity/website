import { Injectable } from "@angular/core";
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

import { apiUrl } from ".";

@Injectable({
	providedIn: "root",
})
export class ChartService {
	constructor(
		private cacheService: CacheService,
		private http: HttpClient,
	) {}
	private readonly apiUrl = `${apiUrl}/charts`;

	// Create
	async createChart(chart: CreateChartModel): Promise<ChartModel> {
		console.log("Creating chart:", chart);
		return await firstValueFrom(
			this.http.post<ChartModel>(this.apiUrl, chart),
		);
	}

	// Read
	getAllCharts(): Observable<ChartModel[]> {
		const charts = this.cacheService.getAllCharts();

		if (charts && charts.length > 0) {
			console.log(`Returning charts from cache...`);

			return new Observable((subscriber) => {
				subscriber.next(charts);
				subscriber.complete();
			});
		} else {
			console.log(
				"It was not possible to get cached charts. Fetching from API...",
			);

			return this.http.get<ChartModel[]>(this.apiUrl).pipe(
				tap((fetchedCharts) => {
					this.cacheService.addCharts(fetchedCharts);
				}),
			);
		}
	}

	async getChartById(id: string): Promise<ChartModel> {
		const cachedChart = this.cacheService.getChart(id);

		if (cachedChart && cachedChart.isFull) {
			console.log(`Returning chart ${id} from cache...`);

			try {
				return Chart.parse(cachedChart);
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
			this.cacheService.addChart(parsedChart);
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
		const updatedChart = await firstValueFrom(
			this.http.put<ChartModel>(`${this.apiUrl}/${id}`, chart),
		);

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
