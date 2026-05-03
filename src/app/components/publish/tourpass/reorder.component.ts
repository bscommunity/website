import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

// Material
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

// CDK
import {
	CdkDrag,
	CdkDropList,
	CdkDragHandle,
	CdkDragDrop,
	moveItemInArray,
} from "@angular/cdk/drag-drop";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import type { ChartModel } from "@/models/chart.model";
import { type TourPassFormData } from "@/services/publish/handlers/tourpass-publish.handler";

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
										[src]="chart.coverUrl"
										alt="Cover"
										class="w-12 h-12 rounded-md object-cover"
									/>
									<div class="flex flex-col">
										<p class="font-medium">
											{{ chart.track }}
										</p>
										<p
											class="text-sm text-on-surface-variant"
										>
											{{ chart.artist }}
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

	selectedCharts: ChartModel[] = [
		...(this.data.formData.selectedCharts || []),
	];

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
