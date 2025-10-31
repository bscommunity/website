import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";

import { BehaviorSubject, firstValueFrom } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";

import { environment } from "environments/environment";
import { apiUrl } from "@/lib/api";

// Models
import { UserModel } from "@/models/user.model";

// Services
import { CookieService } from "@/services/cookie.service";
import { CacheService } from "@/services/cache.service";

interface AuthResponse {
	user: UserModel;
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

@Injectable({
	providedIn: "root",
})
export class AuthService {
	private cookieService = inject(CookieService);
	private cacheService = inject(CacheService);
	private http = inject(HttpClient);

	private readonly TOKEN_NAME = "bscm_auth";
	private readonly REFRESH_TOKEN_NAME = "bscm_refresh_token";
	private readonly TOKEN_EXPIRY_NAME = "bscm_token_expiry";
	private readonly USER_OBJECT_NAME = "bscm_user";

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

	get refreshToken(): string {
		const refreshToken = this.cookieService.get(this.REFRESH_TOKEN_NAME);
		if (!refreshToken) throw new Error("No refresh token found in cookies");
		return refreshToken;
	}

	get tokenExpiry(): Date | null {
		const expiry = this.cookieService.get(this.TOKEN_EXPIRY_NAME);
		if (!expiry) return null;
		return new Date(expiry);
	}

	get user(): UserModel {
		const user = this.cookieService.get(this.USER_OBJECT_NAME);
		if (!user) throw new Error("No user object found in cookies");
		return JSON.parse(user);
	}

	constructor() {
		this.initializeAuthState();
	}

	private initializeAuthState() {
		if (isPlatformBrowser(this.platformId)) {
			// Check auth status asynchronously to handle token refresh if needed
			this.checkAuthStatus();
		}
	}

	getOAuthUrl(): string {
		return `https://discord.com/oauth2/authorize?client_id=${environment.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(environment.REDIRECT_URI)}&scope=identify+email`;
	}

	private setTokens(
		accessToken: string,
		refreshToken: string,
		expiresIn: number,
	): void {
		const expires = new Date(Date.now() + expiresIn * 1000);
		const tokenExpiry = new Date(Date.now() + (expiresIn - 60) * 1000); // Expire 1 minute early for safety

		this.cookieService.set(this.TOKEN_NAME, accessToken, {
			expires,
			path: "/",
		});
		this.cookieService.set(this.REFRESH_TOKEN_NAME, refreshToken, {
			expires,
			path: "/",
		});
		this.cookieService.set(
			this.TOKEN_EXPIRY_NAME,
			tokenExpiry.toISOString(),
			{ expires, path: "/" },
		);
	}

	isTokenExpiringSoon(): boolean {
		const expiry = this.tokenExpiry;
		if (!expiry) return true;

		const now = new Date();
		const timeUntilExpiry = expiry.getTime() - now.getTime();

		// Consider token expiring if less than 5 minutes remain
		return timeUntilExpiry < 5 * 60 * 1000;
	}

	async refreshAccessToken(): Promise<boolean> {
		try {
			const refreshToken = this.refreshToken;

			const response = await firstValueFrom(
				this.http.post<RefreshTokenResponse>(`${apiUrl}/auth/refresh`, {
					refreshToken,
				}),
			);

			this.setTokens(
				response.accessToken,
				response.refreshToken,
				response.expiresIn,
			);

			console.log("Access token refreshed successfully");
			return true;
		} catch (error) {
			console.error("Failed to refresh access token:", error);
			this.logout();
			return false;
		}
	}

	async getValidToken(): Promise<string> {
		try {
			// Check if we need to refresh the token
			if (this.isTokenExpiringSoon()) {
				const refreshed = await this.refreshAccessToken();
				if (!refreshed) {
					throw new Error("Failed to refresh token");
				}
			}

			return this.token;
		} catch (error) {
			// If we can't get a valid token, logout
			this.logout();
			throw error;
		}
	}

	async checkAuthStatus(): Promise<boolean> {
		if (!isPlatformBrowser(this.platformId)) {
			return false;
		}

		try {
			const hasToken = !!this.cookieService.get(this.TOKEN_NAME);
			const hasRefreshToken = !!this.cookieService.get(
				this.REFRESH_TOKEN_NAME,
			);

			if (!hasToken || !hasRefreshToken) {
				this._isLoggedIn$.next(false);
				return false;
			}

			// Try to get a valid token (this will refresh if needed)
			await this.getValidToken();
			this._isLoggedIn$.next(true);
			return true;
		} catch (error) {
			this._isLoggedIn$.next(false);
			return false;
		}
	}

	async login(code: string) {
		console.log("Sending request to backend...");

		try {
			// Send the code to the backend
			const response = await firstValueFrom(
				this.http.post<AuthResponse>(`${apiUrl}/auth/discord`, {
					code,
				}),
			);

			// Set the cookies
			this.setTokens(
				response.accessToken,
				response.refreshToken,
				response.expiresIn,
			);

			this.cookieService.set(
				this.USER_OBJECT_NAME,
				JSON.stringify(response.user),
				{
					expires: new Date(Date.now() + response.expiresIn * 1000),
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
			this.cookieService.delete(this.REFRESH_TOKEN_NAME);
			this.cookieService.delete(this.TOKEN_EXPIRY_NAME);
			this.cookieService.delete(this.USER_OBJECT_NAME);
			this.cacheService.clearCache();
			this._isLoggedIn$.next(false);
			this.router.navigate(["/login"], { onSameUrlNavigation: "reload" });
		}
	}
}
