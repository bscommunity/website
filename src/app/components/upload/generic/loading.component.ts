import { ChangeDetectionStrategy, Component } from "@angular/core";

import { MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
	selector: "app-upload-dialog-loading",
	template: `
		<h2 mat-dialog-title>Submitting...</h2>
		<mat-dialog-content
			class="mat-typography !flex items-center justify-center flex-col gap-4"
		>
			<p>
				Please wait while the content is submitted. <br />
				Do not close this window.
			</p>
			<mat-progress-spinner
				class="!my-6"
				mode="indeterminate"
				diameter="48"
			></mat-progress-spinner>
		</mat-dialog-content>
	`,
	imports: [MatDialogModule, MatProgressSpinnerModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogLoadingComponent {}
