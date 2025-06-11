import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
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
				<mat-form-field appearance="outline">
					<mat-label>Gameplay</mat-label>
					<input
						type="text"
						matInput
						formControlName="chartPreviewUrl"
						placeholder="https://youtu.be/BY_XwvKogC8"
					/>
					@if (
						form.get("chartPreviewUrl")?.hasError("invalidUrl") ||
						form.get("chartPreviewUrl")?.hasError("notHttps")
					) {
						<mat-error>Please enter a valid URL</mat-error>
					} @else if (
						form.get("chartPreviewUrl")?.hasError("pattern")
					) {
						<mat-error>Must be a YouTube video URL</mat-error>
					}
				</mat-form-field>
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
	dialogRef =
		inject<MatDialogRef<UploadDialogSection3Component>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	form: FormGroup;

	constructor() {
		this.form = this.fb.group({
			chartUrl: [
				initialFormData.chartUrl,
				[Validators.required, urlValidator(), zipValidator()],
			],
			chartPreviewUrl: [
				initialFormData.chartPreviewUrl,
				[
					urlValidator(),
					(control: AbstractControl) => {
						if (!control.value) return null;
						if (
							youtubePattern1.test(control.value) ||
							youtubePattern2.test(control.value)
						) {
							return null;
						}
						return { pattern: true };
					},
				],
			],
			chartFileData: [null, Validators.required],
		});
	}

	ngOnInit() {
		// Initialize form with existing data
		this.form.patchValue(this.data.formData);

		// If formData has chartPreviewUrl (singular), set it.
		// This handles the case where data might come from an older structure or needs specific handling.
		if (this.data.formData.chartPreviewUrl) {
			this.form
				.get("chartPreviewUrl")
				?.setValue(this.data.formData.chartPreviewUrl);
		}
	}

	get chartUrlControl() {
		return this.form.get("chartUrl");
	}

	get chartPreviewUrl() {
		return this.form.get("chartPreviewUrl");
	}

	// Methods
	// Removed setChartPreviewUrls, addPreviewUrl, and removePreviewUrl as they are for FormArray

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
			const formValue = { ...this.form.value };
			
			// Extract YouTube video ID if chartPreviewUrl is provided
			if (formValue.chartPreviewUrl) {
				formValue.chartPreviewUrl = this.extractYouTubeVideoId(formValue.chartPreviewUrl);
			}
			
			this.dialogRef.close(formValue);
		}
	}

	private extractYouTubeVideoId(url: string): string {
		if (!url) return '';
		
		// Handle youtu.be format: https://youtu.be/VIDEO_ID
		const youtuBeMatch = url.match(/^https:\/\/youtu\.be\/([a-zA-Z0-9-_]+)/);
		if (youtuBeMatch) {
			return youtuBeMatch[1];
		}
		
		// Handle youtube.com format: https://www.youtube.com/watch?v=VIDEO_ID
		const youtubeMatch = url.match(/^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)/);
		if (youtubeMatch) {
			return youtubeMatch[1];
		}
		
		// If no match found, return the original URL (fallback)
		return url;
	}
}

const youtubePattern1 = /^https:\/\/youtu\.be\/[a-zA-Z0-9-_]+(?:\?.*)?$/i;
const youtubePattern2 =
	/^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9-_]+(?:&.*)?$/i;

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
