import { Component } from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-public-header",
	imports: [MatIconModule, MatButtonModule],
	templateUrl: "./public-header.component.html",
})
export class PublicHeaderComponent {}
