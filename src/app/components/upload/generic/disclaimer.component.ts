import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-upload-dialog-disclaimer",
	template: `
		<h2 mat-dialog-title>Disclaimer</h2>
		<mat-dialog-content class="mat-typography !flex flex-col gap-2">
			<p class="mb-2">
				By submitting your content, you confirm that you hold the
				necessary rights or permissions for its use.
			</p>
			<p>
				You accept full responsibility for any legal or
				copyright-related issues and we reserve the right to remove any
				content that does not comply with our guidelines.
			</p>
		</mat-dialog-content>
		<mat-dialog-actions align="center">
			<button
				class="!w-[49%]"
				mat-button
				type="button"
				(click)="dialogRef.close('back')"
			>
				Back
			</button>
			<button
				class="!w-[49%]"
				mat-flat-button
				(click)="dialogRef.close('next')"
			>
				I agree
			</button>
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogDisclaimerComponent {	dialogRef = inject<MatDialogRef<UploadDialogDisclaimerComponent>>(MatDialogRef);

}
