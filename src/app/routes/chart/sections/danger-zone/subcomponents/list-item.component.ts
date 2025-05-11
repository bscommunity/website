import { Component, Input } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-danger-zone-list-item",
	templateUrl: "./list-item.component.html",
	imports: [MatButtonModule],
})
export class DangerZoneListItemComponent {
	@Input() title: string = "";
	@Input() description: string = "";
	@Input() buttonLabel: string = "";
	@Input() buttonAction: () => void = () => {};
}
