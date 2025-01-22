import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";

import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { UploadErrorData } from "../upload.service";

@Component({
	selector: "app-upload-dialog-error",
	template: `
		<h2 mat-dialog-title>Oh, oh.</h2>

		<mat-dialog-content class="mat-typography !flex flex-col gap-2">
			<p class="mb-2">
				An unexpected error occurred while processing your request:
				{{ data.message }}
				<br />
				Please try again or
				<a class="underline" href="https://github.com/">check issues</a>
				if the problem persists.
			</p>
			<details class="w-full overflow-hidden">
				<summary><strong>Error details</strong></summary>
				<pre>{{ data.error }}</pre>
			</details>
		</mat-dialog-content>
		<mat-dialog-actions align="center">
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
	imports: [MatDialogModule, MatButtonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogErrorComponent {
	constructor(
		public dialogRef: MatDialogRef<UploadDialogErrorComponent>,
		@Inject(MAT_DIALOG_DATA) public data: UploadErrorData,
	) {}
}
