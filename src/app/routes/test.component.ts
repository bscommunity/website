import { CookieService } from "@/services/cookie.service";
import { Component } from "@angular/core";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
	selector: "app-test",
	imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
	template: ` <button (click)="setCookie()">TESTE</button> `,
})
export class TestComponent {
	constructor(private cookieService: CookieService) {}

	setCookie() {
		this.cookieService.set("example", "2", {
			expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			path: "/",
		});
	}

	getCookie() {
		console.log(this.cookieService.get("example"));
	}

	deleteCookie() {
		this.cookieService.delete("example");
	}
}
