import { Component, inject, Input } from "@angular/core";

// Modules
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";
import { DeleteChartComponent } from "../../dialogs/delete-chart/delete-chart.component";
import { DangerZoneListItemComponent } from "./subcomponents/list-item.component";
import { ConfirmationDialogComponent } from "../../dialogs/confirmation/confirmation-dialog.component";

// Services
import { ChartService } from "@/services/api/chart.service";

@Component({
	selector: "app-chart-danger-zone-section",
	imports: [
		MatDialogModule,
		ChartSectionComponent,
		MatButtonModule,
		DangerZoneListItemComponent,
	],
	templateUrl: "./danger-zone.component.html",
})
export class DangerZoneComponent {
	@Input() chartId: string = "";
	@Input() chartName: string = "";
	@Input() isPublic: boolean | null = null;

	visibility = this.isPublic ? "public" : "private";

	constructor(
		private dialog: MatDialog,
		private _snackBar: MatSnackBar,
		private chartService: ChartService,
	) {}

	// Open a snackbar with a message
	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: "snackbar",
		});
	}

	openDeleteDialog() {
		this.dialog.open(DeleteChartComponent, {
			data: {
				chartId: this.chartId,
				chartName: this.chartName,
			},
		});
	}

	openVisibilityDialog() {
		// If the chart is public, we want to make it private
		// If the chart is private, we want to make it public
		const newVisibility = this.visibility === "public" ? false : true;
		const newVisibilityText =
			newVisibility === false ? "private" : "public";

		console.log(
			`Updating chart visibility from ${this.visibility} to ${newVisibilityText}`,
		);

		const operation = async () => {
			const result = await this.chartService.updateChart(this.chartId, {
				isPublic: newVisibility,
			});

			if (!result) {
				throw new Error(
					"An error occurred while updating the chart visibility",
				);
			}
		};

		const afterOperation = () => {
			this.dialog.closeAll();
			this.openSnackBar("Chart visibility updated", "Close");
			this.visibility = newVisibility ? "public" : "private";
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Change chart visibility",
				description: `Are you sure you want to make update the chart visibility to <strong>${newVisibilityText.toUpperCase()}</strong>? ${
					newVisibility
						? "This will make the chart visible to everyone."
						: "This will make the chart only visible to you."
				}`,
				operation,
				afterOperation,
			},
		});
	}
}
