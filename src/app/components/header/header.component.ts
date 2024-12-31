import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	imports: [MatIconModule, MatButtonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
