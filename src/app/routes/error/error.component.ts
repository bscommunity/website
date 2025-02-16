import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-error",
	imports: [MatIconModule, MatButtonModule],
	templateUrl: "./error.component.html",
})
export class PageErrorComponent implements OnInit {
	error = "undefined";

	constructor(
		private location: Location,
		private router: Router,
	) {
		this.error = (
			location.getState() as {
				error: string;
			}
		)["error"];
	}

	ngOnInit(): void {
		const navigation = this.router.getCurrentNavigation();
		console.log("Navigation", navigation);

		if (navigation?.extras.state) {
			const error = navigation.extras.state["userId"];

			console.log("Error", error);

			this.error = error;
		}
	}

	reloadPage() {
		// Go back to the previous page
		this.location.back();
	}
}
