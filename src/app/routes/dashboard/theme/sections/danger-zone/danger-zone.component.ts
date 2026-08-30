import { Component, inject, input } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";

// Components
import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";
import { DangerZoneListItemComponent } from "@/components/danger-zone-list-item/danger-zone-list-item.component";
import { DeleteThemeComponent } from "../../dialogs/delete-theme/delete-theme.component";

@Component({
	selector: "app-theme-danger-zone-section",
	imports: [
		MatDialogModule,
		ChartSectionComponent,
		MatButtonModule,
		DangerZoneListItemComponent,
	],
	templateUrl: "./danger-zone.component.html",
})
export class DangerZoneComponent {
	themeId = input.required<string>();
	themeName = input.required<string>();

	readonly dialog = inject(MatDialog);

	noop = () => {};

	openDeleteDialog() {
		this.dialog.open(DeleteThemeComponent, {
			data: {
				id: this.themeId(),
				name: this.themeName(),
			},
			disableClose: true,
		});
	}
}
