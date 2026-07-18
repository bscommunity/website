import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { NgGlyph } from "@ng-icons/core";

@Component({
	selector: "app-not-found",
	imports: [NgGlyph, MatButtonModule],
	templateUrl: "./not-found.html",
})
export class PageNotFoundComponent {}
