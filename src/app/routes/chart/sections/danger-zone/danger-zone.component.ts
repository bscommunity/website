import { Component, inject, Input } from "@angular/core";

// Modules
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";

// Components
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";
import { DeleteChartComponent } from "../../dialogs/delete-chart/delete-chart.component";

@Component({
	selector: "app-chart-danger-zone-section",
	imports: [ChartSectionComponent, MatButtonModule],
	templateUrl: "./danger-zone.component.html",
})
export class DangerZoneComponent {
	@Input() chartId: string = "";
	@Input() chartName: string = "";

	readonly dialog = inject(MatDialog);

	constructor() {}

	openDeleteDialog() {
		this.dialog.open(DeleteChartComponent, {
			data: {
				chartId: this.chartId,
				chartName: this.chartName,
			},
		});
	}
}
