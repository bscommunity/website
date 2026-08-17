import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { Component, inject } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { NgGlyph } from "@ng-icons/core";

@Component({
	selector: "app-error",
	imports: [NgGlyph, MatButtonModule],
	templateUrl: "./error.html",
})
export class PageError {
	private location = inject(Location);
	private router = inject(Router);

	error = "undefined";

	constructor() {
		const navigation = this.router.currentNavigation();

		console.log("Navigation", navigation);
		console.log("Navigation extras", navigation?.extras);

		if (navigation?.extras.state) {
			const error = navigation.extras.state["error"];

			console.log("Error", error);

			this.error = error;
		}
	}

	reloadPage() {
		// Go back to the previous page
		this.location.back();
	}
}
