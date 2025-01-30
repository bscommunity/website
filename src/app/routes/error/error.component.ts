import { Location } from "@angular/common";
import { Component } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-error",
	imports: [MatIconModule, MatButtonModule],
	templateUrl: "./error.component.html",
})
export class PageErrorComponent {
	error = "undefined";

	constructor(private location: Location) {}

	reloadPage() {
		// Refreshes the route, doesn't reload the entire page
		this.location.replaceState(this.location.path());
	}
}
