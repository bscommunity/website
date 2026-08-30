import { Router } from "@angular/router";
import { Component, inject, signal } from "@angular/core";
import { FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Services
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";
import { ChartService } from "@/services/api/chart.service";
import { ViewportScroller } from "@angular/common";

interface DeleteChartDialogData {
	id: string;
	name: string;
}

interface ConfirmDeleteForm {
	confirmName: string;
}

@Component({
	selector: "app-delete-chart-dialog",
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatProgressSpinnerModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	templateUrl: "./delete-chart.component.html",
})
export class DeleteChartComponent {
	private chartService = inject(ChartService);
	private router = inject(Router);
	private viewportScroller = inject(ViewportScroller);
	private formService = inject(FormService);

	readonly _matSnackBar = inject(MatSnackBar);
	readonly dialogRef = inject(MatDialogRef<DeleteChartComponent>);

	readonly data = inject<DeleteChartDialogData>(MAT_DIALOG_DATA);

	confirmField = this.formService.createTextField({
		key: "confirmName",
		label: "Chart name",
		placeholder: "Type chart name",
		required: true,
		validators: [
			Validators.pattern(new RegExp(escapeRegExp(this.data.name))),
		],
		validationMessages: {
			pattern: "Name must match exactly",
		},
	});

	form: FormGroup<ValuesToControls<ConfirmDeleteForm>> =
		this.formService.createFormGroup<ConfirmDeleteForm>(
			[this.confirmField],
			{},
		);

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
			this.dialogRef.close(false);
			this.router
				.navigate(["/dashboard/uploads"], { replaceUrl: true })
				.then(() => this.viewportScroller.scrollToPosition([0, 0]));

			this._matSnackBar.open("Chart deleted successfully", "Dismiss", {
				duration: 2000,
			});
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