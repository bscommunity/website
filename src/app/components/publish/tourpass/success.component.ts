import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

// Material
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

// Models
import type { TourPassModel } from "@/models/tour-pass.model";

@Component({
	selector: "app-publish-tourpass-success",
	template: `
		<h2 mat-dialog-title>Success!</h2>
		<mat-dialog-content class="mat-typography flex! flex-col gap-4">
			<p>Your tour pass was submitted successfully.</p>
			<div class="flex items-center gap-4">
				<div class="flex flex-col">
					<p class="text-base font-semibold">{{ data.name }}</p>
					@if (data.description) {
						<p class="text-sm text-on-surface-variant">
							{{ data.description }}
						</p>
					}
				</div>
			</div>
		</mat-dialog-content>
		<mat-dialog-actions align="center">
			<button mat-flat-button (click)="dialogRef.close()">Close</button>
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishTourPassSuccessComponent {
	dialogRef =
		inject<MatDialogRef<PublishTourPassSuccessComponent>>(MatDialogRef);
	data = inject<TourPassModel>(MAT_DIALOG_DATA);
}
