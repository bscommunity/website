import { Router } from "@angular/router";
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
import { ZodError } from "zod";

@Injectable({
	providedIn: "root",
})
export class ChartService {
	constructor(
		private router: Router,
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
	getAllCharts(forceRefresh: boolean = false): Observable<ChartModel[]> {
		const charts = this.cacheService.getAllCharts();

		if (charts && charts.length > 0 && !forceRefresh) {
			// Check if we are on refresh cooldown
			if (!this.cacheService.isOnRefreshCooldown) {
				console.log(
					"Refresh cooldown is over. Fetching charts from API...",
				);

				// If we are not on refresh cooldown, we can fetch from API
				// Trigger a background fetch to check for updates
				this.http
					.get<
						ChartModel[]
					>(`${this.apiUrl}?fetchContributors=true&fetchVersions=true`)
					.subscribe({
						next: (fetchedCharts) => {
							// Set up a cooldown to prevent too many requests
							this.cacheService.setRefreshCooldown();

							// Compare versions to see if we need to update the cache
							if (
								JSON.stringify(fetchedCharts) !==
								JSON.stringify(charts)
							) {
								console.log("Updating charts in cache...");
								this.cacheService.addCharts(fetchedCharts);

								// If the user is viewing the charts, navigate to the new version
								if (this.router.url.endsWith("/published")) {
									this.router
										.navigateByUrl("/", {
											skipLocationChange: true,
										})
										.then(() => {
											this.router.navigate([
												"/published",
											]);
										});
								}
							}
						},
						error: (error) => {
							// Handle error if needed
							console.error("Failed to fetch charts:", error);
						},
					});
			}

			console.log("Returning cached charts:", charts);

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

		console.log("Cached chart:", cachedChart);

		if (cachedChart) {
			// Trigger a background fetch to check for updates
			// CHANGED: the background fetch is now done in getAllCharts()
			/* this.fetchChartFromRemote(id).subscribe({
				next: (fetchedChart) => {
					// Compare versions to see if we need to update the cache
					if (
						JSON.stringify(fetchedChart.versions) !==
						JSON.stringify(cachedChart.versions)
					) {
						console.log(`Updating chart ${id} in cache...`);
						this.cacheService.updateChart(fetchedChart);

						// If the user is viewing the chart, navigate to the new version
						if (this.router.url.startsWith(`/chart/${id}`)) {
							this.router.navigate(["/chart", id]);

							// We need to reload the page to trigger the resolver
							// and get the updated data
							// window.location.reload();
						}
					}
				},
				error: (error) => {
					// If the chart was deleted, remove it from cache
					if (error.status === 404) {
						console.log(`Removing chart ${id} from cache...`);
						this.cacheService.removeChart(id);
						if (this.router.url.startsWith(`/chart/${id}`)) {
							this.router.navigate(["/"]);
						}
					} else {
						console.error("Failed to fetch chart:", error);
					}
				},
			}); */

			// Return cache data immediately
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
