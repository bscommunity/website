import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { Router } from "@angular/router";

import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

import { ChartComponent } from "app/routes/published/subcomponents/chart.component";
import { SuccessDialogData } from "../../../services/upload.service";

@Component({
	selector: "app-upload-dialog-success",
	template: `
		<h2 mat-dialog-title>Success!</h2>
		<mat-dialog-content class="mat-typography !flex flex-col gap-2">
			<p class="mb-2">
				Your chart was submitted successfully and is ready for review or
				use
			</p>
			<div class="relative w-full">
				<app-chart
					class="pointer-events-none"
					[artist]="data.artist"
					[track]="data.track"
					[coverUrl]="data.coverUrl"
					[difficulty]="data.difficulty"
					[isDeluxe]="data.isDeluxe"
					[isExplicit]="data.isExplicit"
					[duration]="data.duration"
					[notesAmount]="data.notesAmount"
				></app-chart>
				<div
					class="absolute right-8 top-[45%] -translate-y-1/2 rotate-[-4.55deg]"
				>
					<div
						class="px-5 py-2 justify-center items-center flex overflow-hidden stamp-effect border-[6px] border-secondary select-none"
					>
						<p class="text-xl font-bold text-secondary">
							SUBMITTED
						</p>
					</div>
					<p
						class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-secondary opacity-80 w-full text-center"
					>
						v1.0 | {{ data.id.split("-")[0] }}
					</p>
				</div>
			</div>
		</mat-dialog-content>
		<mat-dialog-actions align="center">
			<button
				class="!w-full !mb-3"
				mat-flat-button
				(click)="onAccessButtonClicked()"
			>
				Access chart
			</button>
			<!-- <button
				class="!w-full !mb-2"
				mat-button
				type="button"
				(click)="dialogRef.close()"
			>
				Close
			</button> -->
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule, ChartComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogSuccessComponent {
	constructor(
		public dialogRef: MatDialogRef<UploadDialogSuccessComponent>,
		@Inject(MAT_DIALOG_DATA) public data: SuccessDialogData,
		private router: Router,
	) {}

	onAccessButtonClicked() {
		this.dialogRef.close();
		this.router.navigate([`chart/${this.data.id}`]);
	}
}
