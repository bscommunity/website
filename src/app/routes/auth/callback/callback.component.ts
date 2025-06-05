import { Component, inject, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";

// Material
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialog } from "@angular/material/dialog";

// Components
import { UploadDialogErrorComponent } from "@/components/upload/generic/error.component";

// Services
import { AuthService } from "app/auth/auth.service";

@Component({
	selector: "app-oauth-callback",
	imports: [MatProgressSpinnerModule],
	templateUrl: "./callback.component.html",
})
export class OAuthCallbackComponent implements OnInit {
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private authService = inject(AuthService);

	private platformId = inject(PLATFORM_ID);

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
			this.router.navigate(["/published"]);
		} catch (error: any) {
			console.error("Error: ", error);

			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					message: error.statusText,
					error: error.error // this is stupid but too lazy to fix
						? error.error.message
						: "An error occurred during login",
					redirectTo: "/login",
				},
				disableClose: true,
			});
		}
	}
}
