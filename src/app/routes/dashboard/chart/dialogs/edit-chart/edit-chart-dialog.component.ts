import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
	MAT_DIALOG_DATA,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import {
	ChartDetailsFormComponent,
	ChartDetailsValue,
} from "@/components/chart-details-form/chart-details-form.component";

// Services
import { ChartService } from "@/services/api/chart.service";

// Models
import { ChartModel } from "@/models/chart.model";

export interface EditChartDialogData {
	chart: ChartModel;
}

@Component({
	selector: "app-edit-chart-dialog",
	template: `
		<app-chart-details-form
			title="Edit chart"
			description=""
			submitLabel="Save"
			cancelLabel="Cancel"
			[initialValues]="initialValues"
			[disabled]="isSaving"
			(canceled)="dialogRef.close()"
			(submitted)="onSubmitted($event)"
		/>
	`,
	imports: [ChartDetailsFormComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditChartDialogComponent {
	private chartService = inject(ChartService);
	private _snackBar = inject(MatSnackBar);

	dialogRef = inject<MatDialogRef<EditChartDialogComponent>>(MatDialogRef);
	data = inject<EditChartDialogData>(MAT_DIALOG_DATA);

	isSaving = false;

	initialValues: Partial<ChartDetailsValue> = {
		track: this.data.chart.track.title,
		artist: this.data.chart.track.artist,
		difficulty: this.data.chart.difficulty,
		isDeluxe: this.data.chart.isDeluxe,
		isExplicit: this.data.chart.isExplicit,
	};

	async onSubmitted(value: ChartDetailsValue): Promise<void> {
		this.isSaving = true;

		try {
			const response = await this.chartService.updateChart(
				this.data.chart.id,
				{
					track: value.track,
					artist: value.artist,
					difficulty: value.difficulty,
					isDeluxe: value.isDeluxe,
					isExplicit: value.isExplicit,
				},
			);

			this._snackBar.open("Chart updated successfully", "Close", {
				duration: 2000,
			});

			this.dialogRef.close(response);
		} catch (error) {
			console.error("Failed to update chart", error);
			this._snackBar.open("Failed to update chart", "Close", {
				duration: 3000,
			});
			this.isSaving = false;
		}
	}
}
