import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

// Models
import { UserModel, UserProfileResponseModel } from "@/models/user.model";

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
}
