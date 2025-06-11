import { Router } from "@angular/router";
import { Component, inject, signal } from "@angular/core";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";

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
	id: string;
	name: string;
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

	form = new FormGroup({
		chartName: new FormControl("", [
			Validators.required,
			Validators.pattern(new RegExp(escapeRegExp(this.data.name))),
		]),
	});

	readonly isLoading = signal(false);

	async onSubmit() {
		console.log("Delete chart form submitted");

		if (this.form.invalid) {
			return;
		}

		this.isLoading.update(() => true);
		this.form.disable();

		// Delete the chart
		const response = await this.chartService.deleteChart(this.data.id);

		if (response) {
			this.router.navigate(["/published"]);
			this.dialogRef.close(false);
		} else {
			console.error("Failed to delete chart", response);
			this._matSnackBar.open("Failed to delete chart", "Dismiss", {
				duration: 2000,
			});
			this.dialogRef.close(false);
			this.isLoading.update(() => false);
			this.form.enable();
		}
	}
}

// Scapes special characters in a string for use in a regular expression
function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
