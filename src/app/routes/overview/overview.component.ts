import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";

import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-overview",
	imports: [MatIconModule, MatButtonModule],
	templateUrl: "./overview.component.html",
})
export class OverviewComponent {}
