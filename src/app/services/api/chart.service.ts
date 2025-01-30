import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable } from "rxjs";

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
	constructor(private http: HttpClient) {}
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
		console.log("Fetching all charts");
		return this.http.get<ChartModel[]>(this.apiUrl);
	}

	async getChartById(id: string): Promise<ChartModel> {
		console.log("Fetching chart with ID:", id);

		const response = await firstValueFrom(
			this.http.get<unknown>(`${this.apiUrl}/${id}`),
		);

		try {
			// Validate the response using the Zod schema
			const parsedData = Chart.parse(response);
			return parsedData;
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
