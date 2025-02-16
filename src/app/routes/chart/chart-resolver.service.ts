import { Injectable } from "@angular/core";
import {
	Resolve,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from "@angular/router";
import { ChartService } from "@/services/api/chart.service";
import { ChartModel } from "@/models/chart.model";
import { AuthService } from "@/auth/auth.service";

@Injectable({
	providedIn: "root",
})
export class ChartResolver implements Resolve<any> {
	constructor(
		private chartService: ChartService,
		private router: Router,
		private authService: AuthService,
	) {}

	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<ChartModel | null> {
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
			return chart;
		} catch (error: any) {
			console.error("Error fetching chart", error);

			if (error.status === 401) {
				this.authService.logout();
				return null;
			}

			// In the future, redirect to 404 only if not found
			this.router.navigate(["error"], {
				state: { error: `${error.statusText}: ${error.error.error}` },
			});

			return null;
		}
	}
}
