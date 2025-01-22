import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	OnInit,
} from "@angular/core";

import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidatorFn,
	Validators,
} from "@angular/forms";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

import { UploadFormData } from "../upload.component";

@Component({
	selector: "app-upload-dialog-disclaimer",
	template: `
		<h2 mat-dialog-title>Disclaimer</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography !flex flex-col gap-2">
				<p class="mb-2">
					By submitting your content, you confirm that you hold the
					necessary rights or permissions for its use.
				</p>
				<p>
					You accept full responsibility for any legal or
					copyright-related issues and we reserve the right to remove
					any content that does not comply with our guidelines.
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
				<button class="!w-[49%]" mat-flat-button type="submit">
					I agree
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogDisclaimerComponent {
	form: FormGroup;

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<UploadDialogDisclaimerComponent>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadFormData,
	) {
		this.form = this.fb.group({});
	}

	onSubmit() {
		this.dialogRef.close("next");
	}
}
