import {
	Component,
	inject,
	input,
	Input,
	output,
	EventEmitter,
} from "@angular/core";

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
import { Router, RouterModule } from "@angular/router";

@Component({
	selector: "app-chart-danger-zone-section",
	imports: [
		MatDialogModule,
		ChartSectionComponent,
		MatButtonModule,
		DangerZoneListItemComponent,
		RouterModule,
	],
	templateUrl: "./danger-zone.component.html",
})
export class DangerZoneComponent {
	chartId = input.required<string>();
	chartName = input.required<string>();
	isPublic = input.required<boolean>();
	visibilityChanged = output<boolean>();

	private readonly chartService = inject(ChartService);
	private readonly dialog = inject(MatDialog);
	private readonly _snackBar = inject(MatSnackBar);

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
		const newVisibility = !this.isPublic();

		console.log(
			`Updating chart visibility from ${this.isPublic()} to ${newVisibility}`,
		);

		const operation = async () => {
			await this.chartService.updateChart(this.chartId(), {
				isPublic: newVisibility,
			});
		};

		const afterOperation = () => {
			console.log(`Chart visibility updated to ${newVisibility}`);
			this.visibilityChanged.emit(newVisibility);
			this.dialog.closeAll();
			this.openSnackBar("Chart visibility updated", "Close");
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Change chart visibility",
				description: `Are you sure you want to make update the chart visibility to <b>${
					newVisibility ? "PUBLIC" : "PRIVATE"
				}</b>? ${
					newVisibility
						? "This will make the chart visible to everyone."
						: "This will make the chart only visible to you."
				}`,
				error: "An error occurred while updating the chart visibility",
				operation,
				afterOperation,
			},
		});
	}
}
