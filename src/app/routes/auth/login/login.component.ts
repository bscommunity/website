import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

import { AuthService } from "app/auth/auth.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
	selector: "app-login",
	imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
	templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
	constructor(
		private authService: AuthService,
		private router: Router,
	) {}

	oAuthUrl: string | null = null;

	ngOnInit(): void {
		const redirectUrl = decodeURIComponent(this.router.url)
			.split("?")[1]
			?.split("=")[1];

		this.oAuthUrl =
			this.authService.getOAuthUrl() +
			(redirectUrl ? `&appRedirect=${redirectUrl}` : "");
	}
}
