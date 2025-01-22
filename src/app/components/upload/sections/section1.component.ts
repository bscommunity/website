import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";

import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { UploadFormData } from "../upload.component";

@Component({
	selector: "app-upload-dialog-section1",
	template: `
		<h2 mat-dialog-title>Submit</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography">
				<label id="content-type-group">
					Choose the type of content you'd like to submit.
				</label>
				<mat-radio-group
					aria-labelledby="content-type-group"
					class="flex items-start flex-col my-4"
					formControlName="contentType"
				>
					@for (type of contentTypes; track type) {
						<mat-radio-button
							class="m-1"
							[value]="type"
							[disabled]="!contentEnabledTypes.includes(type)"
						>
							{{ type }}
						</mat-radio-button>
					}
				</mat-radio-group>
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button type="button" mat-button (click)="dialogRef.close()">
					Cancel
				</button>
				<button
					type="submit"
					mat-button
					[disabled]="!form.get('contentType')?.value"
				>
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatRadioModule,
		FormsModule,
		ReactiveFormsModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogSection1Component {
	form: FormGroup;
	contentTypes: string[] = ["Chart", "Tourpass", "Theme"];
	contentEnabledTypes: string[] = ["Chart"];

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<UploadDialogSection1Component>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadFormData,
	) {
		this.form = this.fb.group({
			contentType: [""],
		});
	}

	ngOnInit() {
		// Initialize form with existing data
		this.form.patchValue({
			contentType: this.formData.contentType,
		});
	}

	onSubmit() {
		if (this.form.valid) {
			this.dialogRef.close({
				...this.formData,
				...this.form.value,
			});
		}
	}
}
