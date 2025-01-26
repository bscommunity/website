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
	FormsModule,
	ReactiveFormsModule,
	ValidatorFn,
	Validators,
} from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";

import { initialFormData, UploadFormData } from "../upload.service";
import { FileUploadComponent } from "@/components/file-upload/file-upload.component";
import { ChartFileData } from "@/services/decode.service";

@Component({
	selector: "app-upload-dialog-section3",
	template: `
		<h2 mat-dialog-title>Linking</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography !flex flex-col gap-2">
				<p class="mb-2">
					Provide the URL to your chart file. Ensure your file meets
					the submission guidelines.
				</p>
				<mat-form-field appearance="outline">
					<mat-label>URL</mat-label>
					<input
						type="text"
						matInput
						formControlName="chartUrl"
						placeholder="https://example.com/chart.zip"
					/>
					@if (
						chartUrlControl?.hasError("required") &&
						chartUrlControl?.touched
					) {
						<mat-error>URL is <strong>required</strong></mat-error>
					} @else if (
						chartUrlControl?.hasError("invalidUrl") ||
						chartUrlControl?.hasError("notHttps")
					) {
						<mat-error>Please enter a valid URL</mat-error>
					} @else if (chartUrlControl?.hasError("invalidZipUrl")) {
						<mat-error>URL must point to a .zip file</mat-error>
					}

					<mat-hint align="start"
						>Must be a direct link to the .zip file</mat-hint
					>
				</mat-form-field>
				<app-file-upload formControlName="chartFile"></app-file-upload>
				@if (
					this.form.get("chartFile")?.hasError("required") &&
					this.form.get("chartFile")?.touched
				) {
					<mat-error
						>Chart file metadata is
						<strong>required</strong></mat-error
					>
				}
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
					type="submit"
					[disabled]="form.invalid"
				>
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatLabel,
		MatSelectModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSlideToggleModule,
		ReactiveFormsModule,
		FileUploadComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogSection3Component implements OnInit {
	form: FormGroup;

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<UploadDialogSection3Component>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadFormData,
	) {
		this.form = this.fb.group({
			chartUrl: [
				initialFormData.chartUrl,
				[Validators.required, zipUrlValidator()],
			],
			chartFile: [undefined, Validators.required],
		});
	}

	ngOnInit() {
		// Initialize form with existing data
		this.form.patchValue(this.formData);
	}

	get chartUrlControl() {
		return this.form.get("chartUrl");
	}

	onSubmit() {
		if (this.form.valid) {
			this.dialogRef.close(this.form.value);
		}
	}
}

export function zipUrlValidator(): ValidatorFn {
	const urlPattern = /^https:\/\/.*\/[a-zA-Z0-9-_]+\.zip$/i;

	return (control: AbstractControl): { [key: string]: any } | null => {
		if (!control.value) {
			return null;
		}

		// Check if it's a valid URL
		try {
			new URL(control.value);
		} catch {
			return { invalidUrl: true };
		}

		// Check if it's a valid HTTPS URL
		const isHttps = control.value.toLowerCase().startsWith("https://");

		if (!isHttps) {
			return { notHttps: true };
		}

		// Check if the URL matches our pattern with /{key}.zip at the end
		if (!urlPattern.test(control.value)) {
			return { invalidZipUrl: true };
		}

		return null;
	};
}
