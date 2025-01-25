import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

import { ChartModel, MutateChartModel } from "@/models/chart.model";
import { apiUrl } from ".";

@Injectable({
	providedIn: "root",
})
export class ChartService {
	constructor(private http: HttpClient) {}
	private readonly apiUrl = `${apiUrl}/charts`;

	// Create
	async createChart(chart: MutateChartModel): Promise<ChartModel> {
		console.log("Creating chart:", chart);
		return await firstValueFrom(
			this.http.post<ChartModel>(this.apiUrl, chart),
		);
	}

	// Read
	async getAllCharts(): Promise<ChartModel[]> {
		console.log("Fetching all charts");
		return await firstValueFrom(this.http.get<ChartModel[]>(this.apiUrl));
	}

	async getChartById(id: string): Promise<ChartModel> {
		console.log("Fetching chart with ID:", id);
		return await firstValueFrom(
			this.http.get<ChartModel>(`${this.apiUrl}/${id}`),
		);
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
