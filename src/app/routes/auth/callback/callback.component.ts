import { Component, inject, OnInit, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

// Material
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Services
import { AuthService } from "app/auth/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { UploadDialogErrorComponent } from "@/components/upload/generic/error.component";
import { CookieService } from "@/services/cookie.service";
import { tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { apiUrl } from "@/services/api";
import { isPlatformBrowser } from "@angular/common";

@Component({
	selector: "app-oauth-callback",
	imports: [MatProgressSpinnerModule],
	templateUrl: "./callback.component.html",
})
export class OAuthCallbackComponent implements OnInit {
	private platformId = inject(PLATFORM_ID);

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private cookieService: CookieService,
		private http: HttpClient,
	) {}

	readonly dialog = inject(MatDialog);

	async ngOnInit() {
		if (!isPlatformBrowser(this.platformId)) {
			return;
		}

		const code = this.route.snapshot.queryParamMap.get("code");

		if (!code) {
			console.error("No code found in query params");

			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					error: "No code found in query params",
				},
				disableClose: true,
			});

			return;
		}

		try {
			await this.authService.login(code);
			this.router.navigate(["/"]);
		} catch (error: any) {
			console.error("Error: ", error);

			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					message: error.statusText,
					error: error.error.error, // this is stupid but too lazy to fix
					redirectTo: "/login",
				},
			});
		}

		/* this.http.post<any>(`${apiUrl}/login`, { code }).subscribe({
			next: (response) => {
				console.log(
					"Logged in successfully. Got token:",
					response.token,
				);

				console.log("Setting cookies...");

				this.cookieService.set("this.TOKEN_NAME", response.token, {
					expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
					path: "/",
				});

				this.cookieService.set(
					"this.USER_OBJECT_NAME",
					JSON.stringify(response.user),
					{
						expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
						path: "/",
					},
				);

				console.log("Cookies set");
				console.log(this.cookieService.get("this.TOKEN_NAME"));

				this._isLoggedIn$.next(true);
				console.log("User is logged in");
				this.router.navigateByUrl('/');
			},
			error: (error) => {
				console.error("Error logging in:", error);

				this.dialog.open(UploadDialogErrorComponent, {
					data: {
						error,
					},
				});
			},
		}); */
	}
}
