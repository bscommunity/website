import { Router } from "@angular/router";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

// Material
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";
import { MatFormField } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";

// Services
import { ChartService } from "@/services/api/chart.service";

interface DeleteChartDialogData {
	chartId: string;
	chartName: string;
}

@Component({
	selector: "app-delete-chart-dialog",
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatInputModule,
		MatProgressSpinnerModule,
		MatFormField,
		ReactiveFormsModule,
	],
	templateUrl: "./delete-chart.component.html",
})
export class DeleteChartComponent {
	private chartService = inject(ChartService);
	private router = inject(Router);

	readonly _matSnackBar = inject(MatSnackBar);
	readonly dialogRef = inject(MatDialogRef<DeleteChartComponent>);

	readonly data = inject<DeleteChartDialogData>(MAT_DIALOG_DATA);
	readonly fb = inject(FormBuilder);

	form = this.fb.group({
		chartName: ["", Validators.pattern(escapeRegExp(this.data.chartName))],
	});

	readonly isLoading = signal(false);

	async onSubmit() {
		console.log("Delete chart form submitted");

		if (this.form.invalid) {
			return;
		}

		this.isLoading.update(() => true);

		// Delete the chart
		const response = await this.chartService.deleteChart(this.data.chartId);

		if (response) {
			this.router.navigate(["/published"]);
			this.dialogRef.close(true);
		} else {
			this._matSnackBar.open("Failed to delete chart", "Dismiss", {
				duration: 2000,
			});
		}

		this.isLoading.update(() => false);
	}
}

// Scapes special characters in a string for use in a regular expression
function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
