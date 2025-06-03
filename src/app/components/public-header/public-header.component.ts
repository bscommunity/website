import { Component } from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-public-header",
	imports: [MatIconModule, MatButtonModule, RouterLink],
	templateUrl: "./public-header.component.html",
})
export class PublicHeaderComponent {}
