import { Component, inject, input, output } from "@angular/core";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { AsideSectionComponent } from "./aside-section.component";
import { AsideContainerComponent } from "./aside-container.component";
import { EditTourPassDialogComponent } from "../../dialogs/edit-tourpass/edit-tourpass-dialog.component";

// Models
import { TourPassModel } from "@/models/tour-pass.model";

// Libs
import { transformDuration } from "@/lib/time";

@Component({
	selector: "app-aside",
	templateUrl: "./aside.component.html",
	imports: [AsideSectionComponent, AsideContainerComponent],
})
export class AsideComponent {
	readonly dialog = inject(MatDialog);
	readonly _snackBar = inject(MatSnackBar);

	readonly tourpass = input.required<TourPassModel>();
	readonly tourPassUpdated = output<TourPassModel>();

	transformDuration = transformDuration;

	get totalDuration(): number {
		return this.tourpass().charts.reduce(
			(acc, chart) => acc + (chart.track?.duration || 0),
			0,
		);
	}

	get tracksAmount(): number {
		return this.tourpass().charts.length;
	}

	openEditDialog() {
		const dialogRef = this.dialog.open(EditTourPassDialogComponent, {
			data: {
				tourpass: this.tourpass(),
			},
			width: "500px",
			disableClose: true,
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result && result !== "back") {
				this.tourPassUpdated.emit(result);
			}
		});
	}

	async downloadBundle() {
		this._snackBar.open("Bundle download not available yet", "Close", {
			duration: 3000,
		});
	}
}
