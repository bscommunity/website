import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from "@angular/core";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { PublishTourPassSetlistComponent } from "@/components/publish/tourpass/setlist.component";
import { PublishTourPassReorderComponent } from "@/components/publish/tourpass/reorder.component";

// Services
import { TourPassService } from "@/services/api/tour-pass.service";

// Models
import type { TourPassModel } from "@/models/tour-pass.model";
import type { ChartModel } from "@/models/chart.model";

export interface EditSetlistDialogData {
	tourpass: TourPassModel;
}

@Component({
	selector: "app-edit-setlist-dialog",
	template: `
		@if (isSaving()) {
			<h2 mat-dialog-title>Saving setlist...</h2>
			<mat-dialog-content class="flex items-center justify-center py-8">
				<mat-progress-spinner
					diameter="32"
					mode="indeterminate"
				></mat-progress-spinner>
			</mat-dialog-content>
		} @else if (currentStep() === 'setlist') {
			<app-publish-tourpass-setlist
				[initialCharts]="initialCharts"
				(setlistChanged)="onSetlistChanged($event)"
				(backClicked)="dialogRef.close('back')"
			></app-publish-tourpass-setlist>
		} @else if (currentStep() === 'reorder') {
			<app-publish-tourpass-reorder
				[initialCharts]="selectedCharts()"
				(reordered)="onReordered($event)"
				(backClicked)="currentStep.set('setlist')"
			></app-publish-tourpass-reorder>
		}
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		PublishTourPassSetlistComponent,
		PublishTourPassReorderComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSetlistDialogComponent {
	private tourPassService = inject(TourPassService);
	private _snackBar = inject(MatSnackBar);

	dialogRef = inject<MatDialogRef<EditSetlistDialogComponent>>(MatDialogRef);
	data = inject<EditSetlistDialogData>(MAT_DIALOG_DATA);

	currentStep = signal<"setlist" | "reorder">("setlist");
	isSaving = signal(false);

	initialCharts: ChartModel[] = [...this.data.tourpass.charts];
	selectedCharts = signal<ChartModel[]>([...this.data.tourpass.charts]);

	onSetlistChanged(charts: ChartModel[]) {
		this.selectedCharts.set(charts);
		this.currentStep.set("reorder");
	}

	async onReordered(orderedChartIds: string[]) {
		this.isSaving.set(true);

		try {
			const result = await this.tourPassService.updateTourPass(
				this.data.tourpass.id,
				{ chartIds: orderedChartIds },
			);

			this._snackBar.open("Setlist updated successfully", "Close", {
				duration: 2000,
			});

			this.dialogRef.close(result);
		} catch (error) {
			console.error("Failed to update setlist", error);
			this._snackBar.open("Failed to update setlist", "Close", {
				duration: 3000,
			});
			this.isSaving.set(false);
		}
	}
}
