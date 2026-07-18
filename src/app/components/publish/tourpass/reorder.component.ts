// CDK
import {
	CdkDrag,
	type CdkDragDrop,
	CdkDragHandle,
	CdkDropList,
	moveItemInArray,
} from "@angular/cdk/drag-drop";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
// Material
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import type { ChartModel } from "@/models/chart.model";
import type { TourPassFormData } from "@/services/publish/handlers/tourpass-publish.handler";
// Types
import type { DialogData } from "@/services/publish/publish.service";

@Component({
	selector: "app-publish-tourpass-reorder",
	template: `
		<h2 mat-dialog-title>Reorder</h2>
		<form (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-4">
				<p>Order the charts in the way you think best suits the vibe</p>

				@if (selectedCharts.length === 0) {
					<p class="text-center text-sm text-on-surface-variant">
						No charts selected.
					</p>
				} @else {
					<div
						cdkDropList
						class="flex flex-col gap-3"
						(cdkDropListDropped)="drop($event)"
					>
						@for (
							chart of selectedCharts;
							track chart.id;
							let i = $index
						) {
							<div
								cdkDrag
								class="flex items-center gap-4 bg-surface-container border border-outline-variant/50 rounded-xl p-4"
							>
								<div
									class="text-xs uppercase text-on-surface-variant"
								>
									Track {{ i + 1 }}
								</div>
								<div class="flex items-center gap-3 flex-1">
									<img
										[src]="chart.track.coverUrl"
										alt="Cover"
										class="w-12 h-12 rounded-md object-cover"
									/>
									<div class="flex flex-col">
										<p class="font-medium">
											{{ chart.track.title }}
										</p>
										<p
											class="text-sm text-on-surface-variant"
										>
											{{ chart.track.artist }}
										</p>
									</div>
								</div>
								<mat-icon cdkDragHandle inline
									>drag_handle</mat-icon
								>
							</div>
						}
					</div>
				}
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button
					mat-button
					type="button"
					(click)="dialogRef.close('back')"
				>
					Back
				</button>
				<button
					mat-button
					type="submit"
					[disabled]="selectedCharts.length === 0"
				>
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		FormsModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		CdkDropList,
		CdkDrag,
		CdkDragHandle,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishTourPassReorderComponent {
	dialogRef =
		inject<MatDialogRef<PublishTourPassReorderComponent>>(MatDialogRef);
	data = inject<DialogData<TourPassFormData>>(MAT_DIALOG_DATA);

	selectedCharts: ChartModel[] = [...(this.data.formData.selectedCharts || [])];

	drop(event: CdkDragDrop<ChartModel[]>) {
		moveItemInArray(
			this.selectedCharts,
			event.previousIndex,
			event.currentIndex,
		);
	}

	onSubmit() {
		this.dialogRef.close({
			chartIds: this.selectedCharts.map((chart) => chart.id),
			selectedCharts: [...this.selectedCharts],
		});
	}
}
