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

import { initialFormData, type DialogData } from "@/services/publish.service";
import { FileUploadComponent } from "@/components/file-upload/file-upload.component";
import { ChartFileData } from "@/services/decode.service";
import { PanelComponent } from "../panel/panel.component";
import { BundleZipData } from "@/services/extract.service";

@Component({
	selector: "app-publish-dialog-linking",
	template: `
		<h2 mat-dialog-title>Uploading</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography !flex flex-col gap-4">
				<p class="mb-2">
					Upload your chart bundle to the Drive of your synced
					account. We’ll create a special folder for it. Ensure your
					files meets the submission guidelines.
				</p>
				<!-- <app-file-upload
					[formControl]="form.get("chartFileData")"
					(onFileDecoded)="onFileDecoded($event)"
					[required]="true"
					[accept]="['.zip']"
					[placeholder]="'https://example.com/chart.zip'"
				></app-file-upload> -->
				<app-file-upload
					title="Bundle file"
					[accept]="['.zip']"
					(onFileDecoded)="onBundleFileDecoded($event)"
				/>
				<app-file-upload
					title="Chart file"
					[accept]="['.chart']"
					(onFileDecoded)="onChartFileDecoded($event)"
				/>
				@if (
					this.form.get("chartFileData")?.hasError("required") &&
					this.form.get("chartFileData")?.touched
				) {
					<mat-error
						>Chart file metadata is
						<strong>required</strong></mat-error
					>
				}
				<mat-form-field appearance="outline" subscriptSizing="dynamic">
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
				<app-panel>
					Your chart bundle
					<span class="font-semibold"
						>does not leaves the browser</span
					>. Only the necessary metadata is extracted and stored on
					your submission.
				</app-panel>
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
		PanelComponent,
		FileUploadComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishDialogUploadingComponent implements OnInit {
	private fb = inject(FormBuilder);
	dialogRef =
		inject<MatDialogRef<PublishDialogUploadingComponent>>(MatDialogRef);
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

	onChartFileDecoded(chartFileData: ChartFileData | null): void {
		if (chartFileData) {
			this.form.get("chartFileData")?.setValue(chartFileData); // Set the file value in the form
			this.form.get("chartFileData")?.setErrors(null); // Clear validation errors
		} else {
			this.form.get("chartFileData")?.setValue(null); // Clear the file value
			this.form.get("chartFileData")?.setErrors({ required: true }); // Add required error
		}
	}

	onBundleFileDecoded(bundleZipData: BundleZipData | null): void {
		if (bundleZipData) {
			// Assuming bundleZipData contains chartFileData
			this.form.get("chartFileData")?.setValue(bundleZipData.info);
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
				formValue.chartPreviewUrl = this.extractYouTubeVideoId(
					formValue.chartPreviewUrl,
				);
			}

			this.dialogRef.close(formValue);
		}
	}

	private extractYouTubeVideoId(url: string): string {
		if (!url) return "";

		// Handle youtu.be format: https://youtu.be/VIDEO_ID
		const youtuBeMatch = url.match(
			/^https:\/\/youtu\.be\/([a-zA-Z0-9-_]+)/,
		);
		if (youtuBeMatch) {
			return youtuBeMatch[1];
		}

		// Handle youtube.com format: https://www.youtube.com/watch?v=VIDEO_ID
		const youtubeMatch = url.match(
			/^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)/,
		);
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
