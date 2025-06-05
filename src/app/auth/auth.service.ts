import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";

import { BehaviorSubject, firstValueFrom } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";

import { environment } from "environments/environment";
import { apiUrl } from "@/services/api";

// Models
import { UserModel } from "@/models/user.model";

// Services
import { CookieService } from "@/services/cookie.service";
import { CacheService } from "@/services/cache.service";

interface LoginResponse {
	user: UserModel;
	token: string;
}

@Injectable({
	providedIn: "root",
})
export class AuthService {
	private readonly TOKEN_NAME = "bscm_auth";
	private readonly USER_OBJECT_NAME = "bscm_user";
	private readonly TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

	private platformId = inject(PLATFORM_ID);
	private router = inject(Router);

	private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
	isLoggedIn$ = this._isLoggedIn$.asObservable();

	isLoggedIn = toSignal(this._isLoggedIn$, { initialValue: false });

	get token(): string {
		const token = this.cookieService.get(this.TOKEN_NAME);
		if (!token) throw new Error("No token found in cookies");
		return token;
	}

	get user(): UserModel {
		const user = this.cookieService.get(this.USER_OBJECT_NAME);
		if (!user) throw new Error("No user object found in cookies");
		return JSON.parse(user);
	}

	constructor(
		private cookieService: CookieService,
		private cacheService: CacheService,
		private http: HttpClient,
	) {
		this.initializeAuthState();
	}

	private initializeAuthState() {
		if (isPlatformBrowser(this.platformId)) {
			this._isLoggedIn$.next(!!this.cookieService.get(this.TOKEN_NAME));
		}
	}

	getOAuthUrl(): string {
		return `https://discord.com/oauth2/authorize?client_id=${environment.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(environment.REDIRECT_URI)}&scope=identify+email`;
	}

	async login(code: string) {
		console.log("Sending request to backend...");

		try {
			// Send the code to the backend
			const response = await firstValueFrom(
				this.http.post<LoginResponse>(`${apiUrl}/login`, { code }),
			);

			// Set the token and user object in cookies
			this.cookieService.set(this.TOKEN_NAME, response.token, {
				expires: new Date(Date.now() + this.TOKEN_DURATION),
				path: "/",
			});

			this.cookieService.set(
				this.USER_OBJECT_NAME,
				JSON.stringify(response.user),
				{
					expires: new Date(Date.now() + this.TOKEN_DURATION),
					path: "/",
				},
			);

			// Update the auth state
			this._isLoggedIn$.next(true);

			return true;
		} catch (error) {
			this._isLoggedIn$.next(false);

			console.error("Failed to log in:", error);
			throw error;
		}
	}

	logout() {
		if (isPlatformBrowser(this.platformId)) {
			console.log("Logging out...");
			this.cookieService.delete(this.TOKEN_NAME);
			this.cookieService.delete(this.USER_OBJECT_NAME);
			this.cacheService.clearCache();
			this._isLoggedIn$.next(false);
			this.router.navigate(["/login"], { onSameUrlNavigation: "reload" });
		}
	}
}
