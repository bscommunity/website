import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ChartModel } from "@/models/chart.model";

// Types

@Injectable({
	providedIn: "root",
})
export class ChartsService {
	private apiUrl = "charts";

	constructor(private http: HttpClient) {}

	getAllCharts(): Observable<ChartModel[]> {
		return this.http.get<any[]>(this.apiUrl);
	}

	getChartById(id: string): Observable<ChartModel> {
		console.log("Fetching chart with ID:", id);

		if (id !== "1") {
			return new Observable((observer) => {
				observer.error("Chart not found");
			});
		}

		/* return this.http.get<ChartModel>(`${this.apiUrl}/${id}`); */
		return this.http.get<ChartModel>("charts", {
			headers: {},
		});
	}
}
