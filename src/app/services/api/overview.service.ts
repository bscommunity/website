import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, tap } from "rxjs";

import { apiUrl } from "@/lib/api";
import type { OverviewResponseModel } from "@/models/overview.model";
import { StorageService } from "@/services/storage.service";

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const CACHE_PREFIX = "overview:";

interface CacheEntry {
	data: OverviewResponseModel;
	cachedAt: number;
}

@Injectable({
	providedIn: "root",
})
export class OverviewService {
	private http = inject(HttpClient);
	private storageService = inject(StorageService);

	private readonly meUrl = `${apiUrl}/me`;

	getOverview(
		range: "7d" | "30d" | "all" = "30d",
		disableCache = false,
	): Observable<OverviewResponseModel> {
		const cacheKey = `${CACHE_PREFIX}${range}`;

		if (!disableCache) {
			const cached = this.getFromCache(cacheKey);
			if (cached) return of(cached);
		}

		return this.http
			.get<OverviewResponseModel>(`${this.meUrl}/overview`, {
				params: { range },
			})
			.pipe(tap((response) => this.setCache(cacheKey, response)));
	}

	private getFromCache(key: string): OverviewResponseModel | null {
		const raw = this.storageService.getItem(key, true);
		if (!raw) return null;

		try {
			const entry = JSON.parse(raw) as CacheEntry;
			if (Date.now() - entry.cachedAt > CACHE_TTL) {
				this.storageService.removeItem(key, true);
				return null;
			}
			return entry.data;
		} catch {
			this.storageService.removeItem(key, true);
			return null;
		}
	}

	private setCache(key: string, data: OverviewResponseModel): void {
		const entry: CacheEntry = { data, cachedAt: Date.now() };
		this.storageService.setItem(key, JSON.stringify(entry), true);
	}

	invalidateCache(): void {
		const keys = this.storageService.getKeysWithPrefix(CACHE_PREFIX, true);
		for (const key of keys) {
			this.storageService.removeItem(key, true);
		}
	}
}
