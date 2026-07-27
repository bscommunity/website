import { Component, inject, input } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";

// Components
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";
import { DangerZoneListItemComponent } from "./subcomponents/list-item.component";
import { DeleteTourPassComponent } from "../../dialogs/delete-tourpass/delete-tourpass.component";

@Component({
	selector: "app-tourpass-danger-zone-section",
	imports: [
		MatDialogModule,
		ChartSectionComponent,
		MatButtonModule,
		DangerZoneListItemComponent,
	],
	templateUrl: "./danger-zone.component.html",
})
export class DangerZoneComponent {
	tourPassId = input.required<string>();
	tourPassName = input.required<string>();

	readonly dialog = inject(MatDialog);

	noop = () => {};

	openDeleteDialog() {
		this.dialog.open(DeleteTourPassComponent, {
			data: {
				id: this.tourPassId(),
				name: this.tourPassName(),
			},
			disableClose: true,
		});
	}
}
