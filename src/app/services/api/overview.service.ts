import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import type { Observable } from "rxjs";

import { apiUrl } from "@/lib/api";
import type { OverviewResponseModel } from "@/models/overview.model";
import { DocumentCacheService } from "@/services/document-cache.service";

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const CACHE_PREFIX = "overview:";

@Injectable({
	providedIn: "root",
})
export class OverviewService {
	private http = inject(HttpClient);
	private documentCache = inject(DocumentCacheService);

	private readonly meUrl = `${apiUrl}/me`;

	getOverview(
		range: "7d" | "30d" | "all" = "30d",
		disableCache = false,
	): Observable<OverviewResponseModel> {
		return this.documentCache.fetch(
			`${CACHE_PREFIX}${range}`,
			this.http.get<OverviewResponseModel>(`${this.meUrl}/overview`, {
				params: { range },
			}),
			{ ttlMs: CACHE_TTL, disableCache },
		);
	}

	invalidateCache(): void {
		this.documentCache.invalidate(CACHE_PREFIX);
	}
}
