import { Injectable } from "@angular/core";
import {
	Resolve,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from "@angular/router";
import { ChartService } from "@/services/api/chart.service";
import { ChartModel } from "@/models/chart.model";

@Injectable({
	providedIn: "root",
})
export class ChartResolver implements Resolve<any> {
	constructor(
		private chartService: ChartService,
		private router: Router,
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
		} catch (error) {
			console.error("Error fetching chart", error);

			this.router.navigate(["404"], {
				info: { error },
			});
			return null;
		}
	}
}
