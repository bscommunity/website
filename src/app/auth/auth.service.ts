import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import {
	BehaviorSubject,
	tap,
	catchError,
	of,
	Observable,
	firstValueFrom,
} from "rxjs";
import { toSignal, takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { environment } from "environments/environment";
import { apiUrl } from "@/services/api";

import { UserModel } from "@/models/user.model";
import { CookieService } from "@/services/cookie.service";
import { Router } from "@angular/router";

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

	private platformId = inject(PLATFORM_ID);
	private cookieService = inject(CookieService);
	private http = inject(HttpClient);
	private router = inject(Router);

	private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
	isLoggedIn$ = this._isLoggedIn$.asObservable();

	isLoggedIn = toSignal(this._isLoggedIn$, { initialValue: false });

	get token(): string {
		const token = this.cookieService.get(this.TOKEN_NAME);
		if (!token) throw new Error("No token found in cookies");
		return token;
	}

	constructor() {
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

	login(code: string) {
		console.log("Sending request to backend...");

		try {
			this.http
				.post<LoginResponse>(`${apiUrl}/login`, { code })
				.subscribe({
					next: ({ user, token }) => {
						console.log(
							"Logged in successfully. Got token:",
							token,
						);

						console.log("Setting cookies...");

						this.cookieService.set(this.TOKEN_NAME, token, {
							expires: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000,
							), // 7 days
							path: "/",
						});
						this.cookieService.set(
							this.USER_OBJECT_NAME,
							JSON.stringify(user),
							{
								expires: new Date(
									Date.now() + 7 * 24 * 60 * 60 * 1000,
								), // 7 days
								path: "/",
							},
						);
						this._isLoggedIn$.next(true);

						console.log(
							"All cookies: ",
							this.cookieService.getAll(),
						);

						// this.router.navigate(["/"]);
					},
					error: (error) => {
						console.error("Failed to log in:", error);
						throw error;
					},
				});
		} catch (error) {
			this._isLoggedIn$.next(false);

			console.error("Failed to log in:", error);
			throw error;
		}
	}

	logout() {
		if (isPlatformBrowser(this.platformId)) {
			this.cookieService.delete(this.TOKEN_NAME);
			this.cookieService.delete(this.USER_OBJECT_NAME);
			this._isLoggedIn$.next(false);
		}
	}
}
