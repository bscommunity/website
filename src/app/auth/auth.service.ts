import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { BehaviorSubject, tap, catchError, of, Observable } from "rxjs";
import { toSignal, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UserModel } from "@/models/user.model";
import { apiUrl } from "@/services/api/api";

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
	private http = inject(HttpClient);

	private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
	isLoggedIn$ = this._isLoggedIn$.asObservable();

	isLoggedIn = toSignal(this._isLoggedIn$, { initialValue: false });

	get token(): string {
		if (!isPlatformBrowser(this.platformId)) {
			throw new Error("Cannot access token on server");
		}
		const token = this.getCookie(this.TOKEN_NAME);
		if (!token) throw new Error("No token found in cookies");
		return token;
	}

	constructor() {
		this.initializeAuthState();
	}

	private initializeAuthState() {
		if (isPlatformBrowser(this.platformId)) {
			this._isLoggedIn$.next(!!this.getCookie(this.TOKEN_NAME));
		}
	}

	login(): Observable<LoginResponse> {
		console.log("Logging in...");

		return this.http.get<LoginResponse>(`${apiUrl}/login`).pipe(
			tap((response) => {
				console.log("Logged in successfully. Got token:", response);

				if (isPlatformBrowser(this.platformId)) {
					this.setCookie(this.TOKEN_NAME, response.token, 7);
					this.setCookie(
						this.USER_OBJECT_NAME,
						JSON.stringify(response.user),
						7,
					);
					this._isLoggedIn$.next(true);
				}
			}),
			catchError((error) => {
				console.error("Failed to log in:", error);

				this._isLoggedIn$.next(false);
				return of(error);
			}),
		);
	}

	logout() {
		if (isPlatformBrowser(this.platformId)) {
			this.deleteCookie(this.TOKEN_NAME);
			this.deleteCookie(this.USER_OBJECT_NAME);
			this._isLoggedIn$.next(false);
		}
	}

	private setCookie(name: string, value: string, days: number) {
		if (!isPlatformBrowser(this.platformId)) return;

		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = `expires=${date.toUTCString()}`;
		document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict;Secure`;
	}

	private getCookie(name: string): string | null {
		if (!isPlatformBrowser(this.platformId)) return null;

		const cookieName = `${name}=`;
		const decodedCookie = decodeURIComponent(document.cookie);
		const cookieArray = decodedCookie.split(";");

		for (let cookie of cookieArray) {
			cookie = cookie.trim();
			if (cookie.startsWith(cookieName)) {
				return cookie.substring(cookieName.length);
			}
		}
		return null;
	}

	private deleteCookie(name: string) {
		if (!isPlatformBrowser(this.platformId)) return;
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
	}
}
