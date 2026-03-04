import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

// Models
import {
	ItemsPageModel,
	ChartActivityItem,
	UserModel,
	UserProfileResponseModel,
} from "@/models/user.model";
import { ChartModel } from "@/models/chart.model";

// Lib
import { apiUrl } from "@/lib/api";

@Injectable({
	providedIn: "root",
})
export class UserService {
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/users`;

	// Read
	searchUsers(query: string): Observable<UserModel[]> {
		return this.http.get<UserModel[]>(this.apiUrl, {
			params: { search: query },
		});
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

	getUserActivity(
		userId: string,
		params: { limit?: number; offset?: number } = {},
	): Observable<ChartActivityItem[]> {
		return this.http.get<ChartActivityItem[]>(
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
