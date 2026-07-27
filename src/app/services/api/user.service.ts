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

@Injectable({
	providedIn: "root",
})
export class UserService {
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/users`;
	private readonly meUrl = `${apiUrl}/me`;

	private readonly searchCache = new Map<string, UserModel[]>();

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
			limit?: number;
			offset?: number;
		} = {},
	): Observable<ItemsPageModel<CatalogItemModel>> {
		const httpParams: Record<string, string | number> = {};
		if (params.types) httpParams["types"] = params.types;
		if (params.query) httpParams["query"] = params.query;
		if (params.sortBy) httpParams["sortBy"] = params.sortBy;
		if (params.limit !== undefined) httpParams["limit"] = params.limit;
		if (params.offset !== undefined) httpParams["offset"] = params.offset;

		return this.http.get<ItemsPageModel<CatalogItemModel>>(
			`${this.meUrl}/uploads`,
			{ params: httpParams },
		);
	}

	getPublicTourPasses(
		params: { query?: string; sortBy?: string; limit?: number; offset?: number; count?: boolean } = {},
	): Observable<[TourPassModel[], number | null]> {
		const httpParams: Record<string, string | number | boolean> = {};
		if (params.query) httpParams["query"] = params.query;
		if (params.sortBy) httpParams["sortBy"] = params.sortBy;
		if (params.limit !== undefined) httpParams["limit"] = params.limit;
		if (params.offset !== undefined) httpParams["offset"] = params.offset;
		if (params.count) httpParams["count"] = true;

		return this.http.get<[TourPassModel[], number | null]>(
			`${apiUrl}/tourpasses`,
			{ params: httpParams },
		);
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
