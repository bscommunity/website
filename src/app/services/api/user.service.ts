import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, map, tap } from "rxjs";

import {
	ItemsPageModel,
	UserActivityItem,
	UserModel,
	UserProfileResponseModel,
} from "@/models/user.model";
import type { ChartModel } from "@/models/chart.model";
import { TourPassModel } from "@/models/tour-pass.model";
import type { CatalogItemModel } from "@/models/catalog-item.model";

import { apiUrl } from "@/lib/api";
import type { QueryPage } from "../cache.service";
import { CacheService } from "../cache.service";

@Injectable({
	providedIn: "root",
})
export class UserService {
	private http = inject(HttpClient);
	private cacheService = inject(CacheService);

	private readonly apiUrl = `${apiUrl}/users`;
	private readonly meUrl = `${apiUrl}/me`;

	private readonly searchCache = new Map<string, UserModel[]>();

	// Read
	searchUsers(query: string): Observable<UserModel[]> {
		const cached = this.searchCache.get(query);
		if (cached) return of(cached);

		return this.http
			.get<UserModel[]>(this.apiUrl, {
				params: { search: query },
			})
			.pipe(tap((results) => this.searchCache.set(query, results)));
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
		params: {
			query?: string;
			sortBy?: string;
			limit?: number;
			offset?: number;
		} = {},
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
	): Observable<QueryPage<CatalogItemModel>> {
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
			const cached = this.cacheService.getQuery<CatalogItemModel>("upload", cacheKey, "session");
			if (cached) {
				return of(cached);
			}
		}

		return this.http
			.get<ItemsPageModel<CatalogItemModel>>(`${this.meUrl}/uploads`, { params: httpParams })
			.pipe(
				map((res) => ({
					items: res.items,
					total:
						res.counts
							? (res.counts.charts ?? 0) + (res.counts.tourPasses ?? 0) + (res.counts.themes ?? 0)
							: null,
				})),
				tap((page) => {
					if (!isPaginated) {
						this.cacheService.setQuery("upload", cacheKey, page, "session", 30_000);
					}
					this.cacheService.upsertEntities("upload", page.items);
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
		return parts.join("|");
	}
	getPublicTourPasses(
		params: {
			query?: string;
			sortBy?: string;
			limit?: number;
			offset?: number;
			count?: boolean;
			disableCache?: boolean;
		} = {},
	): Observable<QueryPage<TourPassModel>> {
		const httpParams: Record<string, string | number | boolean> = {};
		if (params.query) httpParams["query"] = params.query;
		if (params.sortBy) httpParams["sortBy"] = params.sortBy;
		if (params.limit !== undefined) httpParams["limit"] = params.limit;
		if (params.offset !== undefined) httpParams["offset"] = params.offset;
		if (params.count) httpParams["count"] = true;

		const cacheKey = this.buildTourPassesCacheKey(httpParams);
		const isPaginated = (params.offset ?? 0) > 0;

		if (!params.disableCache && !isPaginated) {
			const cached = this.cacheService.getQuery<TourPassModel>("tourpass", cacheKey, "session");
			if (cached) {
				return of(cached);
			}
		}

		return this.http
			.get<[TourPassModel[], number | null]>(`${apiUrl}/tourpasses`, { params: httpParams })
			.pipe(
				map((res) => ({ items: res[0], total: res[1] })),
				tap((page) => {
					if (!isPaginated) {
						this.cacheService.setQuery("tourpass", cacheKey, page, "session", 30_000);
					}
					this.cacheService.upsertEntities("tourpass", page.items);
				}),
			);
	}

	private buildTourPassesCacheKey(params: Record<string, string | number | boolean>): string {
		const parts = [
			params["query"] || "",
			params["sortBy"] || "",
			params["limit"] || 20,
		];
		return parts.join("|");
	}

	getPublicThemes(
		params: {
			query?: string;
			sortBy?: string;
			limit?: number;
			offset?: number;
			count?: boolean;
		} = {},
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
