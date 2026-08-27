import { Component, inject, input, output, signal } from "@angular/core";
import { Router } from "@angular/router";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { AsideSectionComponent } from "@/components/aside-section/aside-section.component";
import { AsideContainerComponent } from "@/components/aside-container/aside-container.component";
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";
import { EditChartDialogComponent } from "../../dialogs/edit-chart/edit-chart-dialog.component";

// Services
import { ChartService } from "@/services/api/chart.service";

// Models
import { ChartModel } from "@/models/chart.model";

// Libs
import { transformDuration } from "@/lib/time";
import { NgGlyph } from "@ng-icons/core";
import { Visibility } from "@/models/enums/visibility.enum";
import { abbreviateNumber } from "@/lib/number";

@Component({
	selector: "app-aside",
	templateUrl: "./aside.component.html",
	imports: [
		AsideSectionComponent,
		AsideContainerComponent,
		DifficultyMarkComponent,
		NgGlyph,
	],
})
export class AsideComponent {
	readonly dialog = inject(MatDialog);
	readonly _snackBar = inject(MatSnackBar);

	readonly router = inject(Router);
	readonly chartService = inject(ChartService);

	readonly chart = input.required<ChartModel>();
	readonly chartUpdated = output<ChartModel>();

	visibility = Visibility;

	transformDuration = transformDuration;
	abbreviateNumber = abbreviateNumber;

	isFetchingBundle = signal(false);

	openEditDialog() {
		const dialogRef = this.dialog.open(EditChartDialogComponent, {
			data: {
				chart: this.chart(),
			},
			width: "560px",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result && result !== "back") {
				this.chartUpdated.emit(result);
			}
		});
	}

	async share() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			this._snackBar.open("Link copied to clipboard", "Close", {
				duration: 3000,
			});
		} catch {
			this._snackBar.open("Could not copy link", "Close", {
				duration: 3000,
			});
		}
	}

	async downloadBundle() {
		try {
			console.log("Downloading bundle...");
			this.isFetchingBundle.set(true);
			/* await Promise.resolve(
				new Promise((resolve) => setTimeout(resolve, 2000)),
			); */
			const url = await this.chartService.getBundleUrl(this.chart().id);
			window.open(url, "_blank");
		} catch {
			this._snackBar.open("Failed to get download link", "Close", {
				duration: 2500,
			});
		} finally {
			this.isFetchingBundle.set(false);
			console.log("Finished downloading bundle.");
		}
	}
}
