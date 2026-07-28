import { Component, inject, input, output } from "@angular/core";

// Modules
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterModule } from "@angular/router";
import { ConfirmationDialogComponent } from "@/components/dialogs/confirmation/confirmation-dialog.component";
// Enums
import { Visibility } from "@/models/enums/visibility.enum";
// Services
import { ChartService } from "@/services/api/chart.service";
import { DeleteChartComponent } from "../../dialogs/delete-chart/delete-chart.component";
// Components
import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";
import { DangerZoneListItemComponent } from "@/components/danger-zone-list-item/danger-zone-list-item.component";

const VISIBILITY_LABELS: Record<Visibility, string> = {
	[Visibility.PUBLIC]: "Public",
	[Visibility.UNLISTED]: "Unlisted",
	[Visibility.PRIVATE]: "Private",
};

const VISIBILITY_DESCRIPTIONS: Record<Visibility, string> = {
	[Visibility.PUBLIC]: "This will make the chart visible to everyone.",
	[Visibility.UNLISTED]: "The chart will be accessible via direct link only.",
	[Visibility.PRIVATE]: "This will make the chart only visible to you.",
};

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
	visibility = input.required<Visibility>();
	visibilityChanged = output<Visibility>();

	readonly chartService = inject(ChartService);
	readonly dialog = inject(MatDialog);
	readonly _snackBar = inject(MatSnackBar);

	readonly visibilityLabels = VISIBILITY_LABELS;

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
				id: this.chartId(),
				name: this.chartName(),
			},
			disableClose: true,
		});
	}

	openVisibilityDialog() {
		const newVisibility =
			this.visibility() === Visibility.PUBLIC
				? Visibility.PRIVATE
				: Visibility.PUBLIC;

		console.log(
			`Updating chart visibility from ${this.visibility()} to ${newVisibility}`,
		);

		const operation = async () => {
			await this.chartService.updateChart(this.chartId(), {
				visibility: newVisibility,
			});

			console.log(`Chart visibility updated to ${newVisibility}`);
			this.visibilityChanged.emit(newVisibility);
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Change chart visibility",
				description: `Are you sure you want to update the chart visibility to <b>${VISIBILITY_LABELS[newVisibility]}</b>? ${VISIBILITY_DESCRIPTIONS[newVisibility]}`,
				success: "Chart visibility updated",
				error: "An error occurred while updating the chart visibility",
				operation,
			},
		});
	}
}
