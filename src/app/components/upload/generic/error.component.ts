import { ChangeDetectionStrategy, Component } from "@angular/core";

import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-upload-dialog-error",
	template: `
		<h2 mat-dialog-title>Oh, oh.</h2>

		<mat-dialog-content class="mat-typography !flex flex-col gap-2">
			<p class="mb-2">
				An unexpected error occurred while processing your request.
				<br />
				Please try again or
				<a class="underline" href="https://github.com/">check issues</a>
				if the problem persists.
			</p>
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
	constructor(public dialogRef: MatDialogRef<UploadDialogErrorComponent>) {}
}
