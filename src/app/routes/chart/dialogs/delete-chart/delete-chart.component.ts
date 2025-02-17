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

// Services
import { ChartService } from "@/services/api/chart.service";
import { Router } from "@angular/router";
import { MatInputModule } from "@angular/material/input";

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
	readonly dialogRef = inject(MatDialogRef<DeleteChartComponent>);
	readonly data = inject<DeleteChartDialogData>(MAT_DIALOG_DATA);
	readonly fb = inject(FormBuilder);

	form = this.fb.group({
		chartName: ["", Validators.pattern(this.data.chartName)],
	});

	readonly isLoading = signal(false);

	constructor(
		private chartService: ChartService,
		private router: Router,
	) {}

	async onSubmit() {
		console.log("Delete chart form submitted");

		if (this.form.invalid) {
			return;
		}

		this.isLoading.update(() => true);

		// Delete the chart
		try {
			await this.chartService.deleteChart(this.data.chartId);
			this.router.navigate(["/"]);
		} catch (error) {
			console.error(error);
		}

		this.isLoading.update(() => false);
		this.dialogRef.close(true);
	}
}
