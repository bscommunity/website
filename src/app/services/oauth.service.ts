import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

import { environment } from "environments/environment";

// Services
import { AuthService } from "@/services/auth.service";
import { StorageService } from "./storage.service";

// Lib
import { apiUrl } from "../../lib/api";

@Injectable({
	providedIn: "root",
})
export class OAuthService {
	private storageService = inject(StorageService);
	private authService = inject(AuthService);
	private http = inject(HttpClient);

	private readonly GOOGLE_SCOPES_NAME = "bscm_google_scopes";

	private readonly clientId = environment.GOOGLE_CLIENT_ID;
	private readonly redirectUri = environment.GOOGLE_REDIRECT_URI;
	private readonly scope = environment.GOOGLE_SCOPES;

	hasDriveScopeSignal = signal(this.getHasDriveScope());

	private getHasDriveScope(): boolean {
		const scopes = this.storageService.getItem(this.GOOGLE_SCOPES_NAME);
		if (!scopes) return false;
		return scopes.includes("drive.file");
	}

	get hasDriveScope(): boolean {
		return this.hasDriveScopeSignal();
	}

	getGoogleOAuthUrl(): string {
		const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
		url.searchParams.set("client_id", this.clientId);
		url.searchParams.set("redirect_uri", this.redirectUri);
		url.searchParams.set("response_type", "code");
		url.searchParams.set("scope", this.scope);
		url.searchParams.set("access_type", "offline");

		return url.toString();
	}

	async linkGoogleAccount(code: string) {
		if (!this.authService.isLoggedIn()) {
			throw new Error("User is not logged in");
		}

		console.log("Linking Google account...");

		try {
			const response = await firstValueFrom(
				this.http.post<{ scope: string }>(
					`${apiUrl}/auth/google/link`,
					{ code },
				),
			);

			this.storageService.setItem(
				this.GOOGLE_SCOPES_NAME,
				response.scope,
			);
			this.hasDriveScopeSignal.set(this.getHasDriveScope());

			console.log("Google account linked successfully");
		} catch (error) {
			console.error("Error linking Google account:", error);
			throw error;
		}
	}

	async unlinkGoogleAccount() {
		if (!this.authService.isLoggedIn()) {
			throw new Error("User is not logged in");
		}

		console.log("Unlinking Google account...");

		try {
			await firstValueFrom(
				this.http.post(`${apiUrl}/auth/google/unlink`, {}),
			);
			this.storageService.removeItem(this.GOOGLE_SCOPES_NAME);
			this.hasDriveScopeSignal.set(this.getHasDriveScope());
			console.log("Google account unlinked successfully");
		} catch (error) {
			console.error("Error unlinking Google account:", error);
			throw error;
		}
	}
}
