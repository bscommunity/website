import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	Input,
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

// Components
import { FileUploadComponent } from "@/components/file-upload/file-upload.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Data
import { initialChartFormData } from "@/services/chart-publish.handler";

// Types
import { type BundleZipData } from "@/services/extract.service";
import { type ChartFileData } from "@/services/decode.service";
import { type DialogData } from "@/services/publish.service";

@Component({
	selector: "app-publish-chart-source",
	template: `
		<h2 mat-dialog-title>
			{{ mode === "uploading" ? "Uploading" : "Linking" }}
		</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography !flex flex-col gap-4">
				@if (mode === "uploading") {
					<p class="mb-2">
						Upload your chart bundle to the Drive of your synced
						account. Ensure your files meets the submission
						guidelines.
					</p>
				} @else if (mode === "linking") {
					<p class="mb-2">
						Provide the URL to your chart bundle. Ensure your file
						meets the submission guidelines.
					</p>
				}
				@if (mode === "uploading") {
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
						form.get("chartFileData")?.hasError("required") &&
						form.get("chartFileData")?.touched
					) {
						<mat-error>
							Chart file metadata is <strong>required</strong>
						</mat-error>
					}
				} @else {
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
							<mat-error>
								URL is <strong>required</strong>
							</mat-error>
						}
						@if (
							chartUrlControl?.hasError("invalidUrl") ||
							chartUrlControl?.hasError("notHttps")
						) {
							<mat-error> Please enter a valid URL </mat-error>
						}
						@if (chartUrlControl?.hasError("invalidZipUrl")) {
							<mat-error>
								URL must point to a .zip file
							</mat-error>
						}
						<mat-hint align="start"
							>Must be a direct link to the .zip file</mat-hint
						>
					</mat-form-field>
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
						<mat-error> Please enter a valid URL </mat-error>
					}
					@if (form.get("chartPreviewUrl")?.hasError("pattern")) {
						<mat-error> Must be a YouTube video URL </mat-error>
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
export class PublishChartSourceComponent implements OnInit {
	dialogRef = inject<MatDialogRef<PublishChartSourceComponent>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	private fb = inject(FormBuilder);
	form: FormGroup;

	@Input() mode: "linking" | "uploading" = "linking";

	constructor() {
		this.form = this.fb.group({
			chartUrl: [
				initialChartFormData.chartUrl,
				[Validators.required, urlValidator(), zipValidator()],
			],
			chartPreviewUrl: [
				initialChartFormData.chartPreviewUrl,
				[urlValidator(), youtubeValidator()],
			],
			chartFileData: [null, Validators.required],
		});
	}

	ngOnInit() {
		this.form.patchValue(this.data.formData);
		if (this.data.formData?.chartPreviewUrl) {
			this.form
				.get("chartPreviewUrl")
				?.setValue(this.data.formData.chartPreviewUrl);
		}
		if ((this.data as any).mode) {
			this.mode = (this.data as any).mode;
		}
	}

	get chartUrlControl() {
		return this.form.get("chartUrl");
	}

	onChartFileDecoded(chartFileData: ChartFileData | null): void {
		if (chartFileData) {
			this.form.get("chartFileData")?.setValue(chartFileData);
			this.form.get("chartFileData")?.setErrors(null);
		} else {
			this.form.get("chartFileData")?.setValue(null);
			this.form.get("chartFileData")?.setErrors({ required: true });
		}
	}

	onBundleFileDecoded(bundleZipData: BundleZipData | null): void {
		if (bundleZipData) {
			this.form.get("chartFileData")?.setValue(bundleZipData.info);
			this.form.get("chartFileData")?.setErrors(null);
		} else {
			this.form.get("chartFileData")?.setValue(null);
			this.form.get("chartFileData")?.setErrors({ required: true });
		}
	}

	onSubmit() {
		if (this.form.valid) {
			const formValue = { ...this.form.value };
			if (formValue.chartPreviewUrl) {
				formValue.chartPreviewUrl = this.extractYouTubeVideoId(
					formValue.chartPreviewUrl,
				);
			}
			this.dialogRef.close(formValue);
		}
	}

	private extractYouTubeVideoId(url: string): string {
		if (!url) throw new Error("URL is required");
		for (const pattern of PATTERNS.youtube) {
			const match = url.match(pattern);
			if (match && match[1]) return match[1];
		}
		return url;
	}
}

const PATTERNS = {
	youtube: [
		/^https:\/\/youtu\.be\/[\w-]+(?:\?.*)?$/i,
		/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+(?:&.*)?$/i,
	],
	zip: /^https:\/\/.*\/[\w-]+\.zip$/i,
};

function patternValidator(
	pattern: RegExp | RegExp[],
	errorKey: string,
): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		if (!control.value) return null;
		const patterns = Array.isArray(pattern) ? pattern : [pattern];
		if (patterns.some((p) => p.test(control.value))) return null;
		return { [errorKey]: true };
	};
}

function urlValidator(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		if (!control.value) return null;
		try {
			new URL(control.value);
		} catch {
			return { invalidUrl: true };
		}
		if (!control.value.toLowerCase().startsWith("https://"))
			return { notHttps: true };
		return null;
	};
}

const zipValidator = () => patternValidator(PATTERNS.zip, "invalidZipUrl");
const youtubeValidator = () => patternValidator(PATTERNS.youtube, "pattern");
