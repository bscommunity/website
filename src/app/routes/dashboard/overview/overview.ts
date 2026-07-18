import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";

import { NgGlyph } from "@ng-icons/core";

@Component({
	selector: "app-overview",
	imports: [NgGlyph, MatButtonModule],
	templateUrl: "./overview.html",
})
export class OverviewComponent {}
