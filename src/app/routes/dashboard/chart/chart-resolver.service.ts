import { Injectable, inject } from "@angular/core";
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

// Services
import { ChartService } from "@/services/api/chart.service";

// Models
import { ChartModel, withLatestVersion } from "@/models/chart.model";

// Zod
import { ZodError } from "zod";

@Injectable({
	providedIn: "root",
})
export class ChartResolver implements Resolve<ChartModel | null> {
	private chartService = inject(ChartService);
	private router = inject(Router);

	async resolve(route: ActivatedRouteSnapshot): Promise<ChartModel | null> {
		const chartId = route.paramMap.get("id");

		if (!chartId) {
			console.error("Chart ID not provided");

			this.router.navigate(["404"], {
				info: { error: "Chart ID not provided" },
			});
			return null;
		}

		try {
			const chart = await this.chartService.getChartById(chartId);
			return withLatestVersion(chart);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error("Error fetching chart", error);

			// Handle Zod validation errors
			if (error instanceof ZodError) {
				// console.error("Zod validation failed", error.errors);
				this.router.navigate(["error"], {
					state: { error: "Invalid chart data structure" },
				});
				return null;
			}

			if (error.status === 404 || error.status === 400) {
				console.error("Chart not found");
				this.router.navigate(["404"], {
					state: { error: "Chart not found" },
				});
				return null;
			}

			this.router.navigate(["error"], {
				state: { error: `${error.statusText}: ${error.error}` },
			});

			return null;
		}
	}
}
