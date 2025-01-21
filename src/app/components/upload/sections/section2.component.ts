import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";

import {
	FormControl,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

import { UploadDialogSection1Component } from "./section1.component";
import { UploadFormData } from "../upload.component";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";

@Component({
	selector: "app-upload-dialog-section2",
	template: `
		<h2 mat-dialog-title>Chart details</h2>
		<mat-dialog-content class="mat-typography">
			<p>
				Fill in the details for your chart submission. Make sure all the
				required fields are filled before proceeding
			</p>
			<mat-form-field class="example-full-width">
				<mat-label>Email</mat-label>
				<input
					type="email"
					matInput
					[formControl]="emailFormControl"
					placeholder="Ex. pat@example.com"
				/>
				@if (
					emailFormControl.hasError("email") &&
					!emailFormControl.hasError("required")
				) {
					<mat-error>Please enter a valid email address</mat-error>
				}
				@if (emailFormControl.hasError("required")) {
					<mat-error>Email is <strong>required</strong></mat-error>
				}
			</mat-form-field>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button mat-dialog-close>Cancel</button>
			<button mat-button [mat-dialog-close]="true" cdkFocusInitial>
				Continue
			</button>
		</mat-dialog-actions>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatLabel,
		MatFormFieldModule,
		FormsModule,
		ReactiveFormsModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogSection2Component {
	emailFormControl = new FormControl("", [
		Validators.required,
		Validators.email,
	]);

	constructor(
		public dialogRef: MatDialogRef<UploadDialogSection1Component>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadFormData,
	) {}
}
