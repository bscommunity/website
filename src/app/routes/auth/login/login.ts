import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { NgIcon } from "@ng-icons/core";

import { AuthService } from "@/services/auth.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { environment } from "@/environments/environment";

@Component({
	selector: "app-login",
	imports: [
		MatButtonModule,
		NgIcon,
		MatProgressSpinnerModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
	],
	templateUrl: "./login.html",
})
export class Login implements OnInit {
	private authService = inject(AuthService);
	private router = inject(Router);

	oAuthUrl: string | null = null;
	devMode = environment.DEV_MODE;

	testUsername = "";
	testLoading = false;
	testError: string | null = null;

	readonly seededUsers = [
		"nova",
		"axel",
		"luna",
		"kai",
		"ember",
		"sage",
		"riley",
		"zara",
		"orion",
		"pixel",
	];

	ngOnInit(): void {
		const redirectUrl = decodeURIComponent(this.router.url)
			.split("?")[1]
			?.split("=")[1];

		this.oAuthUrl =
			this.authService.getOAuthUrl() +
			(redirectUrl ? `&appRedirect=${redirectUrl}` : "");
	}

	async onTestLogin() {
		if (!this.testUsername) return;

		this.testLoading = true;
		this.testError = null;

		try {
			await this.authService.testLogin(this.testUsername);
			this.router.navigate(["/dashboard/uploads"]);
		} catch (error: any) {
			this.testError =
				error?.error?.error || "Test login failed. Is DEV_MODE enabled on the server?";
		} finally {
			this.testLoading = false;
		}
	}
}
