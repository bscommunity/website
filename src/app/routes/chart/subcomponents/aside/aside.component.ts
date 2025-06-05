import { Component, inject, input } from "@angular/core";
import { Router } from "@angular/router";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { AsideSectionComponent } from "./aside-section.component";
import { AsideContainerComponent } from "./aside-container.component";
import { UploadDialogLoadingComponent } from "@/components/upload/generic/loading.component";
import { UploadDialogErrorComponent } from "@/components/upload/generic/error.component";
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";

// Services
import {
	uploadStepComponents,
	UploadFormData,
} from "@/services/upload.service";
import { ChartService } from "@/services/api/chart.service";

// Models
import { ChartModel, ChartWithLatestVersionModel } from "@/models/chart.model";

// Libs
import { transformDuration } from "@/lib/time";

@Component({
	selector: "app-aside",
	templateUrl: "./aside.component.html",
	imports: [
		AsideSectionComponent,
		AsideContainerComponent,
		DifficultyMarkComponent,
	],
})
export class AsideComponent {
	readonly dialog = inject(MatDialog);
	readonly _snackBar = inject(MatSnackBar);

	readonly router = inject(Router);
	readonly chartService = inject(ChartService);

	readonly chart = input.required<ChartWithLatestVersionModel>();

	transformDuration = transformDuration;

	openEditChartDialog(): void {
		console.log("openEditChartDialog");

		const chartValue = this.chart();
  const dialogRef = this.dialog.open(uploadStepComponents[1], {
			data: {
				title: "Edit Chart",
				description:
					"Edit the chart information. Fields like title and artist can't be changed since they are used to identify the chart.",
				formData: {
					track: chartValue?.track,
					artist: chartValue?.artist,
					difficulty: chartValue?.difficulty,
					isDeluxe: chartValue?.isDeluxe,
					isExplicit: chartValue?.isExplicit,
				},
				inactive: ["track", "artist"],
			},
		});

		dialogRef
			.afterClosed()
			.subscribe((result: UploadFormData | "back" | undefined) => {
				if (result == "back" || result == undefined) return;

				this.dialog.open(UploadDialogLoadingComponent);

				const { difficulty, isDeluxe, isExplicit, ...rest } = result;

				const chart: Partial<ChartModel> = {
					difficulty: difficulty,
					isDeluxe: isDeluxe,
					isExplicit: isExplicit,
				};

				this.updateChart(chart);
			});
	}

	async updateChart(chart: Partial<ChartModel>) {
		try {
			const response = await this.chartService.updateChart(
				this.chart().id,
				chart,
			);

			if (!response) {
				this.dialog.closeAll();
				this.dialog.open(UploadDialogErrorComponent, {
					data: {
						message: "Failed to update chart.",
						error: "No response from server.",
					},
				});
				return;
			}

			console.log("Chart updated with success:", response);

			// Reload the page to reflect the changes
			this.router
				.navigateByUrl("/", { skipLocationChange: true })
				.then(() => {
					this.router.navigate(["/chart", this.chart().id]);
				});

			this._snackBar.open("Chart updated with success!", "Close");
			this.dialog.closeAll();
		} catch (error: any) {
			console.error("Failed to update the chart:", error);

			this.dialog.closeAll();
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					title: "Failed to update the chart.",
					error: error.message,
				},
			});
		}
	}
}
