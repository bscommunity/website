import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-not-found",
	imports: [MatIconModule, MatButtonModule],
	templateUrl: "./not-found.html",
})
export class PageNotFoundComponent {}
