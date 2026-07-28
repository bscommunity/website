import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, tap } from "rxjs";

// Models
import {
	ItemsPageModel,
	UserActivityItem,
	UserModel,
	UserProfileResponseModel,
} from "@/models/user.model";
import { ChartModel } from "@/models/chart.model";
import { TourPassModel } from "@/models/tour-pass.model";
import type { CatalogItemModel } from "@/models/catalog-item.model";

// Lib
import { apiUrl } from "@/lib/api";
import { StorageService } from "../storage.service";

@Injectable({
	providedIn: "root",
})
export class UserService {
	private http = inject(HttpClient);
	private storageService = inject(StorageService);

	private readonly apiUrl = `${apiUrl}/users`;
	private readonly meUrl = `${apiUrl}/me`;

	private readonly searchCache = new Map<string, UserModel[]>();
	private readonly uploadsCacheKeys = new Set<string>();

	// Read
	searchUsers(query: string): Observable<UserModel[]> {
		const cached = this.searchCache.get(query);
		if (cached) return of(cached);

		return this.http.get<UserModel[]>(this.apiUrl, {
			params: { search: query },
		}).pipe(
			tap((results) => this.searchCache.set(query, results)),
		);
	}

	getUserByUsername(username: string): Observable<UserProfileResponseModel> {
		return this.http.get<UserProfileResponseModel>(
			`${this.apiUrl}/username/${username}`,
		);
	}

	getUserCharts(
		userId: string,
		params: { limit?: number; offset?: number } = {},
	): Observable<ItemsPageModel<ChartModel>> {
		return this.http.get<ItemsPageModel<ChartModel>>(
			`${this.apiUrl}/${userId}/charts`,
			{ params },
		);
	}

	getUserTourPasses(
		userId: string,
		params: { query?: string; sortBy?: string; limit?: number; offset?: number } = {},
	): Observable<ItemsPageModel<TourPassModel>> {
		return this.http.get<ItemsPageModel<TourPassModel>>(
			`${this.apiUrl}/${userId}/tourpasses`,
			{ params },
		);
	}

	getMyUploads(
		params: {
			types?: string;
			query?: string;
			sortBy?: string;
			genres?: string;
			difficulties?: string;
			versions?: string;
			limit?: number;
			offset?: number;
			disableCache?: boolean;
		} = {},
	): Observable<ItemsPageModel<CatalogItemModel>> {
		const httpParams: Record<string, string | number> = {};
		if (params.types) httpParams["types"] = params.types;
		if (params.query) httpParams["query"] = params.query;
		if (params.sortBy) httpParams["sortBy"] = params.sortBy;
		if (params.genres) httpParams["genres"] = params.genres;
		if (params.difficulties) httpParams["difficulties"] = params.difficulties;
		if (params.versions) httpParams["versions"] = params.versions;
		if (params.limit !== undefined) httpParams["limit"] = params.limit;
		if (params.offset !== undefined) httpParams["offset"] = params.offset;

		const cacheKey = this.buildUploadsCacheKey(httpParams);
		const isPaginated = (params.offset ?? 0) > 0;

		if (!params.disableCache && !isPaginated) {
			const cached = this.getFromUploadsCache(cacheKey);
			if (cached) {
				return of(cached);
			}
		}

		return this.http.get<ItemsPageModel<CatalogItemModel>>(
			`${this.meUrl}/uploads`,
			{ params: httpParams },
		).pipe(
			tap((response) => {
				if (!isPaginated) {
					this.uploadsCacheKeys.add(cacheKey);
					this.setUploadsCache(cacheKey, response);
				}
			}),
		);
	}

	private buildUploadsCacheKey(params: Record<string, string | number>): string {
		const parts = [
			params["types"] || "all",
			params["query"] || "",
			params["sortBy"] || "",
			params["genres"] || "",
			params["difficulties"] || "",
			params["versions"] || "",
			params["limit"] || 20,
		];
		return `uploads_${parts.join("|")}`;
	}

	private getFromUploadsCache(key: string): ItemsPageModel<CatalogItemModel> | null {
		const raw = this.storageService.getItem(key, true);
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw);
			if (parsed && Array.isArray(parsed.items)) {
				return parsed as ItemsPageModel<CatalogItemModel>;
			}
		} catch {
			this.storageService.removeItem(key, true);
		}
		return null;
	}

	private setUploadsCache(key: string, data: ItemsPageModel<CatalogItemModel>): void {
		this.storageService.setItem(key, JSON.stringify(data), true);
	}

	updateUploadsCacheItem(id: string, data: Partial<CatalogItemModel>): void {
		for (const key of this.uploadsCacheKeys) {
			const cached = this.getFromUploadsCache(key);
			if (!cached) continue;

			const item = cached.items.find((i) => i.id === id);
			if (item) {
				Object.assign(item, data);
				this.setUploadsCache(key, cached);
			}
		}
	}

	invalidateUploadsCache(): void {
		for (const key of this.uploadsCacheKeys) {
			this.storageService.removeItem(key, true);
		}
		this.uploadsCacheKeys.clear();
	}

	getPublicTourPasses(
		params: { query?: string; sortBy?: string; limit?: number; offset?: number; count?: boolean; disableCache?: boolean } = {},
	): Observable<[TourPassModel[], number | null]> {
		const httpParams: Record<string, string | number | boolean> = {};
		if (params.query) httpParams["query"] = params.query;
		if (params.sortBy) httpParams["sortBy"] = params.sortBy;
		if (params.limit !== undefined) httpParams["limit"] = params.limit;
		if (params.offset !== undefined) httpParams["offset"] = params.offset;
		if (params.count) httpParams["count"] = true;

		const cacheKey = this.buildTourPassesCacheKey(httpParams);
		const isPaginated = (params.offset ?? 0) > 0;

		if (!params.disableCache && !isPaginated) {
			const cached = this.getFromTourPassesCache(cacheKey);
			if (cached) {
				return of(cached);
			}
		}

		return this.http.get<[TourPassModel[], number | null]>(
			`${apiUrl}/tourpasses`,
			{ params: httpParams },
		).pipe(
			tap((response) => {
				if (!isPaginated) {
					this.setTourPassesCache(cacheKey, response);
				}
			}),
		);
	}

	private buildTourPassesCacheKey(params: Record<string, string | number | boolean>): string {
		const parts = [
			params["query"] || "",
			params["sortBy"] || "",
			params["limit"] || 20,
		];
		return `tourpasses_${parts.join("|")}`;
	}

	private getFromTourPassesCache(key: string): [TourPassModel[], number | null] | null {
		const raw = this.storageService.getItem(key, true);
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw);
			if (parsed && Array.isArray(parsed[0])) {
				return parsed as [TourPassModel[], number | null];
			}
		} catch {
			this.storageService.removeItem(key, true);
		}
		return null;
	}

	private setTourPassesCache(key: string, data: [TourPassModel[], number | null]): void {
		this.storageService.setItem(key, JSON.stringify(data), true);
	}

	getPublicThemes(
		params: { query?: string; sortBy?: string; limit?: number; offset?: number; count?: boolean } = {},
	): Observable<[CatalogItemModel[], number | null]> {
		const httpParams: Record<string, string | number | boolean> = {};
		if (params.query) httpParams["query"] = params.query;
		if (params.sortBy) httpParams["sortBy"] = params.sortBy;
		if (params.limit !== undefined) httpParams["limit"] = params.limit;
		if (params.offset !== undefined) httpParams["offset"] = params.offset;
		if (params.count) httpParams["count"] = true;

		return this.http.get<[CatalogItemModel[], number | null]>(
			`${apiUrl}/themes`,
			{ params: httpParams },
		);
	}

	getUserActivity(
		userId: string,
		params: { limit?: number; offset?: number } = {},
	): Observable<UserActivityItem[]> {
		return this.http.get<UserActivityItem[]>(
			`${this.apiUrl}/${userId}/activity`,
			{ params },
		);
	}

	followUser(userId: string): Observable<string> {
		return this.http.post(`${this.apiUrl}/${userId}/follow`, null, {
			responseType: "text",
		});
	}

	unfollowUser(userId: string): Observable<string> {
		return this.http.delete(`${this.apiUrl}/${userId}/follow`, {
			responseType: "text",
		});
	}
}
