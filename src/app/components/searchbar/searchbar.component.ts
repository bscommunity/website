import { ChangeDetectionStrategy, Component } from "@angular/core";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";

@Component({
	selector: "app-searchbar",
	templateUrl: "./searchbar.component.html",
	imports: [MatIconModule, MatMenuModule, MatButtonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchbarComponent {
	constructor() {}
}
