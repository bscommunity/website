import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";

import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormControl,
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

import { initialFormData, type DialogData } from "@/services/upload.service";
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
					<mat-label>Bundle</mat-label>
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
				<!-- Multiple Preview URLs -->
				<div
					class="w-full flex flex-row items-center justify-center gap-4"
					formArrayName="chartPreviewUrls"
				>
					@for (urlCtrl of chartPreviewUrls.controls; track $index) {
						<mat-form-field
							class="w-full relative"
							appearance="outline"
						>
							<mat-label
								>Gameplay URL
								{{ $index > 1 ? $index + 1 : "" }}</mat-label
							>
							<input
								type="text"
								class="w-full"
								matInput
								[formControlName]="$index"
								placeholder="https://youtu.be/BY_XwvKogC8"
							/>
							@if (
								urlCtrl.hasError("invalidUrl") ||
								urlCtrl.hasError("notHttps")
							) {
								<mat-error>Please enter a valid URL</mat-error>
							} @else if (urlCtrl.hasError("pattern")) {
								<mat-error
									>URL must be a "youtu.be" video</mat-error
								>
							}
						</mat-form-field>
					}
					<!-- @if (chartPreviewUrls.length < 2) {
						<button
							mat-button
							type="button"
							(click)="addPreviewUrl()"
						>
							+
						</button>
					} @else {
						<button
							mat-icon-button
							(click)="removePreviewUrl($index)"
						>
							✖
						</button>
					} -->
				</div>
				<app-file-upload
					(onFileDecoded)="onFileDecoded($event)"
				></app-file-upload>
				@if (
					this.form.get("chartFileData")?.hasError("required") &&
					this.form.get("chartFileData")?.touched
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
	private fb = inject(FormBuilder);
	dialogRef = inject<MatDialogRef<UploadDialogSection3Component>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	form: FormGroup;

	constructor() {
		this.form = this.fb.group({
			chartUrl: [
				initialFormData.chartUrl,
				[Validators.required, urlValidator(), zipValidator()],
			],
			chartPreviewUrls: this.fb.array(
				[
					new FormControl("", [
						urlValidator(),
						Validators.pattern(youtubePattern),
					]),
				],
				Validators.maxLength(2),
			),
			chartFileData: [null, Validators.required],
		});
	}

	ngOnInit() {
		// Initialize form with existing data
		this.form.patchValue(this.data.formData);

		if (this.data.formData.chartPreviewUrls) {
			this.data.formData.chartPreviewUrls.forEach((url) =>
				this.chartPreviewUrls.push(
					new FormControl(url, [
						urlValidator(),
						Validators.pattern(youtubePattern),
					]),
				),
			);
		}
	}

	get chartUrlControl() {
		return this.form.get("chartUrl");
	}

	get chartPreviewUrls() {
		return this.form.get("chartPreviewUrls") as FormArray;
	}

	// Methods

	setChartPreviewUrls(urls: string[]) {
		const urlControls = urls.map((url) =>
			this.fb.control(url, [
				urlValidator(),
				Validators.pattern(youtubePattern),
			]),
		);
		this.form.setControl("chartPreviewUrls", this.fb.array(urlControls));
	}

	addPreviewUrl() {
		if (this.chartPreviewUrls.length < 2) {
			this.chartPreviewUrls.push(
				new FormControl("", [
					urlValidator(),
					Validators.pattern(youtubePattern),
				]),
			);
		}
	}

	removePreviewUrl(index: number) {
		this.chartPreviewUrls.removeAt(index);
	}

	onFileDecoded(chartFileData: ChartFileData | null): void {
		if (chartFileData) {
			this.form.get("chartFileData")?.setValue(chartFileData); // Set the file value in the form
			this.form.get("chartFileData")?.setErrors(null); // Clear validation errors
		} else {
			this.form.get("chartFileData")?.setValue(null); // Clear the file value
			this.form.get("chartFileData")?.setErrors({ required: true }); // Add required error
		}
	}

	onSubmit() {
		if (this.form.valid) {
			this.dialogRef.close(this.form.value);
		}
	}
}

const youtubePattern = /^https:\/\/youtu\.be\/[a-zA-Z0-9-_]+(?:\?.*)?$/i;

export function urlValidator(): ValidatorFn {
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

		return null;
	};
}

export function zipValidator(): ValidatorFn {
	const urlPattern = /^https:\/\/.*\/[a-zA-Z0-9-_]+\.zip$/i;

	return (control: AbstractControl): { [key: string]: any } | null => {
		if (!control.value) {
			return null;
		}

		// Check if the URL matches our pattern with /{key}.zip at the end
		if (!urlPattern.test(control.value)) {
			return { invalidZipUrl: true };
		}

		return null;
	};
}
