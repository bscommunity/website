import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "app/auth/auth.service";

@Component({
	selector: "app-login",
	imports: [MatButtonModule],
	templateUrl: "./login.component.html",
})
export class LoginComponent {
	constructor(
		private authService: AuthService,
		private router: Router,
	) {}

	login() {
		this.authService.login().subscribe({
			next: (response) => {
				// Get 'redirectUrl' query param if it exists
				const redirectUrl = decodeURIComponent(this.router.url)
					.split("?")[1]
					?.split("=")[1];

				// Navigate to the redirectUrl or the default route
				this.router.navigate([redirectUrl || "/chart/1"]);
			},
			error: (err) => {
				console.error("Login failed", err);
				// Optionally show an error message to the user
			},
		});
	}
}
