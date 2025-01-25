import { AfterViewInit, Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

// Material
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Services
import { AuthService } from "app/auth/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { UploadDialogErrorComponent } from "@/components/upload/generic/error.component";
import { CookieService } from "@/services/cookie.service";
import { tap } from "rxjs";

@Component({
	selector: "app-oauth-callback",
	imports: [MatProgressSpinnerModule],
	templateUrl: "./callback.component.html",
})
export class OAuthCallbackComponent implements AfterViewInit {
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private cookieService: CookieService,
	) {}

	readonly dialog = inject(MatDialog);

	async ngAfterViewInit() {
		// Extract code from URL parameters
		this.route.queryParams.subscribe(async (params) => {
			const discordCode = params["code"];

			if (discordCode) {
				console.log("Logging in with code:", discordCode);
				try {
					// Send code to backend
					this.authService.login(discordCode);

					/* this.authService.login(discordCode).subscribe({
						next: (response) => {
							console.log("Response: ", response);
							this.cookieService.set("this.TOKEN_NAME", "token", {
								expires: new Date(
									Date.now() + 7 * 24 * 60 * 60 * 1000,
								), // 7 days
								path: "/",
							});
						},
						error: (error) => {
							console.error("Error: ", error);
							this.dialog.open(UploadDialogErrorComponent, {
								data: {
									message: error.statusText,
									error: error.error.error, // this is stupid but too lazy to fix
									redirectTo: "/login",
								},
							});
						},
					}); */
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
			} else {
				console.error("No code found in URL parameters");
				// this.router.navigate(["/login"]);
			}
		});
	}
}
