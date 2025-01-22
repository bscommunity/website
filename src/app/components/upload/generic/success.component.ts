import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { Router } from "@angular/router";

import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { ChartComponent } from "app/routes/published/subcomponents/chart.component";

import { UploadSuccessData } from "../upload.service";

@Component({
	selector: "app-upload-dialog-success",
	template: `
		<h2 mat-dialog-title>Disclaimer</h2>
		<mat-dialog-content class="mat-typography !flex flex-col gap-2">
			<p class="mb-2">
				Your chart was submitted successfully and is ready for review or
				use
			</p>
			<div class="relative w-full">
				<app-chart
					class="pointer-events-none"
					[artist]="formData.artist"
					[name]="formData.title"
					[artist]="formData.artist"
					[coverUrl]="formData.coverUrl"
					[difficulty]="formData.difficulty"
					[duration]="formData.duration"
					[notesAmount]="formData.notesAmount"
					[isDeluxe]="formData.isDeluxe"
					[isExplicit]="formData.isExplicit"
				></app-chart>
				<div
					class="absolute right-8 top-1/2 -translate-y-1/2 px-5 py-2 rotate-[-4.55deg] justify-center items-center flex overflow-hidden stamp-effect border-[6px] border-secondary-container select-none"
				>
					<p class="text-xl font-bold text-secondary-container">
						SUBMITTED
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
			<button
				class="!w-full !mb-2"
				mat-button
				type="button"
				(click)="dialogRef.close()"
			>
				Close
			</button>
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule, ChartComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogSuccessComponent {
	constructor(
		public dialogRef: MatDialogRef<UploadDialogSuccessComponent>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadSuccessData,
		private router: Router,
	) {}

	onAccessButtonClicked() {
		this.dialogRef.close();
		this.router.navigate(["/chart"]);
	}
}
