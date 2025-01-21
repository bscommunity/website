import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	inject,
} from "@angular/core";

import { FormsModule } from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UploadFormData } from "../upload.component";

@Component({
	selector: "app-upload-dialog-section1",
	template: `
		<h2 mat-dialog-title>Upload</h2>
		<mat-dialog-content class="mat-typography">
			<label id="content-type-group">
				Choose the type of content you'd like to upload.
			</label>
			<mat-radio-group
				aria-labelledby="content-type-group"
				class="flex items-start flex-col my-4"
				[(ngModel)]="formData.contentType"
			>
				@for (type of contentTypes; track type) {
					<mat-radio-button class="m-1" [value]="type">
						{{ type }}
					</mat-radio-button>
				}
			</mat-radio-group>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button (click)="dialogRef.close()">Cancel</button>
			<button
				mat-button
				[disabled]="!formData.contentType"
				(click)="dialogRef.close(formData)"
			>
				Continue
			</button>
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule, MatRadioModule, FormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogSection1Component {
	contentTypes: string[] = ["Chart", "Tourpass", "Theme"];

	constructor(
		public dialogRef: MatDialogRef<UploadDialogSection1Component>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadFormData,
	) {}
}
