import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { apiUrl } from "@/lib/api";
import type { OverviewResponseModel } from "@/models/overview.model";

@Injectable({
	providedIn: "root",
})
export class OverviewService {
	private http = inject(HttpClient);

	private readonly meUrl = `${apiUrl}/me`;

	getOverview(
		range: "7d" | "30d" | "all" = "30d",
	): Observable<OverviewResponseModel> {
		return this.http.get<OverviewResponseModel>(`${this.meUrl}/overview`, {
			params: { range },
		});
	}
}
