import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable, tap } from "rxjs";

import { User, UserModel } from "@/models/user.model";
import { apiUrl } from ".";
import { CookieService } from "../cookie.service";

@Injectable({
	providedIn: "root",
})
export class UserService {
	private cookieService = inject(CookieService);
	private http = inject(HttpClient);


	private readonly apiUrl = `${apiUrl}/users`;

	// Read
	searchUsers(query: string): Observable<UserModel[]> {
		return this.http.get<UserModel[]>(this.apiUrl, {
			params: { search: query },
		});
	}
}
