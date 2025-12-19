import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-profile",
	imports: [MatIconModule, MatButtonModule],
	templateUrl: "./profile.html",
})
export class Profile {
	route: ActivatedRoute = inject(ActivatedRoute);

	username: string = this.route.snapshot.params["username"];

	/* constructor() {
		this.contentType = this.route.snapshot.params["type"];
		this.contentId = this.route.snapshot.params["id"];
	} */
}
