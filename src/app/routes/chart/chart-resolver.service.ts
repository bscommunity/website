import { Injectable } from "@angular/core";
import {
	Resolve,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { ChartsService } from "@/services/api/charts.service";

@Injectable({
	providedIn: "root",
})
export class ChartResolver implements Resolve<any> {
	constructor(
		private chartsService: ChartsService,
		private router: Router,
	) {}

	resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<any> {
		const chartId = route.paramMap.get("id");

		if (!chartId) {
			console.error("Chart ID not provided");

			this.router.navigate(["404"], {
				info: { error: "Chart ID not provided" },
			});
			return of(null);
		}

		return this.chartsService.getChartById(chartId).pipe(
			catchError((error) => {
				console.error("Error fetching chart", error);

				this.router.navigate(["404"], {
					info: { error },
				});
				return of(null);
			}),
		);
	}
}
