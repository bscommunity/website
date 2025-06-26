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
import {
	MatFormFieldModule,
	MatLabel,
	MatError,
} from "@angular/material/form-field";

// Models
import { Difficulty } from "@/models/enums/difficulty.enum";

// Components
import { FileUploadComponent } from "@/components/file-upload/file-upload.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Data
import { initialChartFormData } from "@/services/publish/handlers/chart-publish.handler";

// Types
import { type BundleZipData } from "@/services/extract.service";
import { type ChartFileData } from "@/services/decode.service";
import { type DialogData } from "@/services/publish/publish.service";

// Base input interface
interface BaseInput {
	key: string;
	label?: string;
}

// Text input specific properties
interface TextInput extends BaseInput {
	type: "text";
	formControlName: string;
	placeholder?: string;
	hint?: string;
	inputType?: "text" | "url" | "email";
	validationErrors?: {
		[errorKey: string]: string;
	};
}

// File input specific properties
interface FileInput extends BaseInput {
	type: "file";
	title: string;
	accept: string[];
	callback: string;
	required?: boolean;
}

// Union type for all input configurations
type InputConfig = TextInput | FileInput;

interface ChartSource {
	title: string;
	description: string;
	inputs: InputConfig[];
}

// Common input configurations
const COMMON_INPUTS = {
	bundleUrl: {
		type: "text",
		key: "bundle-url",
		label: "Bundle",
		formControlName: "chartUrl",
		inputType: "url",
		placeholder: "https://example.com/chart.zip",
		hint: "Must be a direct link to the .zip file",
		validationErrors: {
			required: "URL is <strong>required</strong>",
			invalidUrl: "Please enter a valid URL",
			notHttps: "Please enter a valid URL",
			invalidZipUrl: "URL must point to a .zip file",
		},
	} as TextInput,

	bundleFile: {
		type: "file",
		key: "bundle-file",
		title: "Bundle file",
		accept: [".zip"],
		callback: "onBundleFileDecoded",
		required: true,
	} as FileInput,

	chartFile: {
		type: "file",
		key: "chart-file",
		title: "Chart file",
		accept: [".chart"],
		callback: "onChartFileDecoded",
		required: true,
	} as FileInput,

	gameplayUrl: {
		type: "text",
		key: "gameplay-url",
		label: "Gameplay",
		formControlName: "chartPreviewUrl",
		inputType: "url",
		placeholder: "https://youtu.be/BY_XwvKogC8",
		validationErrors: {
			invalidUrl: "Please enter a valid URL",
			notHttps: "Please enter a valid URL",
			pattern: "Must be a YouTube video URL",
		},
	} as TextInput,
};

const LinkingModeInfo: ChartSource = {
	title: "Linking",
	description: "Provide the URL to your chart bundle.",
	inputs: [COMMON_INPUTS.bundleUrl],
};

const UploadingModeInfo: ChartSource = {
	title: "Uploading",
	description:
		"Upload your chart bundle to the Drive of your synced account.",
	inputs: [COMMON_INPUTS.bundleFile, COMMON_INPUTS.chartFile],
};

@Component({
	selector: "app-publish-chart-source",
	template: `
		<h2 mat-dialog-title>
			{{ info.title }}
		</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography !flex flex-col gap-4">
				<p class="mb-2">
					{{ info.description }} Ensure your file meets the submission
					guidelines.
				</p>
				<!-- Input fields (specific to each mode) -->
				@for (input of info.inputs; track input.key) {
					@if (input.type === "file") {
						<div class="flex flex-col gap-1">
							<app-file-upload
								[title]="input.title"
								[accept]="input.accept"
								(onFileDecoded)="
									handleFileDecoded(input.callback, $event)
								"
							/>
							@if (hasFileInputError(input)) {
								<mat-error
									[innerHTML]="
										getFileInputErrorMessage(input)
									"
								></mat-error>
							}
						</div>
					} @else if (input.type === "text") {
						<mat-form-field appearance="outline">
							<mat-label>{{ input.label }}</mat-label>
							<input
								[type]="input.inputType || 'text'"
								matInput
								[formControlName]="input.formControlName"
								[placeholder]="input.placeholder || ''"
							/>
							@for (
								error of getInputErrors(input);
								track error.key
							) {
								<mat-error
									[innerHTML]="error.message"
								></mat-error>
							}
							@if (input.hint) {
								<mat-hint align="start">{{
									input.hint
								}}</mat-hint>
							}
						</mat-form-field>
					}
				}
				<!-- Gameplay URL -->
				<mat-form-field appearance="outline" subscriptSizing="dynamic">
					<mat-label>{{ COMMON_INPUTS.gameplayUrl.label }}</mat-label>
					<input
						[type]="COMMON_INPUTS.gameplayUrl.inputType || 'text'"
						matInput
						[formControlName]="
							COMMON_INPUTS.gameplayUrl.formControlName
						"
						[placeholder]="
							COMMON_INPUTS.gameplayUrl.placeholder || ''
						"
					/>
					@for (
						error of getInputErrors(COMMON_INPUTS.gameplayUrl);
						track error.key
					) {
						<mat-error [innerHTML]="error.message"></mat-error>
					}
				</mat-form-field>
				<!-- Disclaimer -->
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
				<button class="!w-[49%]" mat-flat-button type="submit">
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatLabel,
		MatError,
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
	form!: FormGroup;

	@Input() mode: "linking" | "uploading" = "linking";

	// Expose COMMON_INPUTS to template
	readonly COMMON_INPUTS = COMMON_INPUTS;

	// File upload state tracking
	private fileUploadStates: {
		[key: string]: { hasFile: boolean; isValid: boolean };
	} = {};
	private formSubmitted = false;

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
			track: [initialChartFormData.track, Validators.required],
			artist: [initialChartFormData.artist, Validators.required],
			difficulty: [initialChartFormData.difficulty, Validators.required],
			bpm: [initialChartFormData.bpm, Validators.required],
			isDeluxe: [initialChartFormData.isDeluxe],
			notesAmount: [
				initialChartFormData.notesAmount,
				Validators.required,
			],
			effectsAmount: [
				initialChartFormData.effectsAmount,
				Validators.required,
			],
			duration: [initialChartFormData.duration, Validators.required],
		});
	}

	get info(): ChartSource {
		return this.mode === "uploading" ? UploadingModeInfo : LinkingModeInfo;
	}

	/**
	 * Get validation errors for a text input
	 */
	getInputErrors(input: TextInput): Array<{ key: string; message: string }> {
		const control = this.form.get(input.formControlName);
		if (!control || !control.errors || !control.touched) {
			return [];
		}

		const errors: Array<{ key: string; message: string }> = [];
		const inputErrors = input.validationErrors || {};

		for (const [errorKey, errorMessage] of Object.entries(inputErrors)) {
			if (control.hasError(errorKey)) {
				errors.push({ key: errorKey, message: errorMessage });
			}
		}

		return errors;
	}

	/**
	 * Handle file upload callbacks dynamically
	 */
	handleFileDecoded(callbackName: string, data: any): void {
		// Update file state based on callback
		const fileKey = this.getFileKeyFromCallback(callbackName);
		this.fileUploadStates[fileKey] = {
			hasFile: true,
			isValid: data !== null,
		};

		switch (callbackName) {
			case "onBundleFileDecoded":
				this.onBundleFileDecoded(data);
				break;
			case "onChartFileDecoded":
				this.onChartFileDecoded(data);
				break;
			default:
				console.warn(`Unknown callback: ${callbackName}`);
		}
	}

	/**
	 * Get file key from callback name for state tracking
	 */
	private getFileKeyFromCallback(callbackName: string): string {
		switch (callbackName) {
			case "onBundleFileDecoded":
				return "bundle-file";
			case "onChartFileDecoded":
				return "chart-file";
			default:
				return callbackName;
		}
	}

	/**
	 * Check if a file input has errors and should show error message
	 */
	hasFileInputError(input: FileInput): boolean {
		if (!this.formSubmitted) return false;

		const fileState = this.fileUploadStates[input.key];

		// Show error if file is required but not uploaded or invalid
		if (input.required) {
			return !fileState?.hasFile || !fileState?.isValid;
		}

		// Show error if file was uploaded but is invalid
		return fileState?.hasFile && !fileState?.isValid;
	}

	/**
	 * Get error message for file input
	 */
	getFileInputErrorMessage(input: FileInput): string {
		const fileState = this.fileUploadStates[input.key];

		if (!fileState?.hasFile && input.required) {
			return `${input.title} is <strong>required</strong>`;
		}

		if (fileState?.hasFile && !fileState?.isValid) {
			return `Invalid ${input.title.toLowerCase()} format`;
		}

		return "";
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

	hasChartFileDataErrors(): boolean {
		return (
			this.form.get("bpm")?.hasError("required") ||
			this.form.get("notesAmount")?.hasError("required") ||
			this.form.get("effectsAmount")?.hasError("required") ||
			this.form.get("duration")?.hasError("required") ||
			false
		);
	}

	hasBundleFileDataErrors(): boolean {
		return (
			this.form.get("track")?.hasError("required") ||
			this.form.get("artist")?.hasError("required") ||
			this.form.get("difficulty")?.hasError("required") ||
			false
		);
	}

	// Includes: notesAmount, effectsAmount, bpm, duration
	onChartFileDecoded(chartFileData: ChartFileData | null): void {
		if (chartFileData) {
			this.form.get("notesAmount")?.setValue(chartFileData.notesAmount);
			this.form
				.get("effectsAmount")
				?.setValue(chartFileData.effectsAmount);
			this.form.get("bpm")?.setValue(chartFileData.bpm);
			this.form.get("duration")?.setValue(chartFileData.duration);
		} else {
			this.form.get("chartFileData")?.setErrors({ required: true });
		}
	}

	// Includes: title, artist, difficulty (int), bpm, type ("Promode" | "Regular")
	onBundleFileDecoded(bundleZipData: BundleZipData | null): void {
		let difficulty: Difficulty;
		switch (bundleZipData?.difficulty) {
			case 4:
				difficulty = Difficulty.NORMAL;
				break;
			case 3:
				difficulty = Difficulty.HARD;
				break;
			case 1:
				difficulty = Difficulty.EXTREME;
				break;
			default:
				difficulty = Difficulty.NORMAL;
				break;
		}

		console.log("Bundle file data", bundleZipData);

		if (bundleZipData) {
			this.form.get("track")?.setValue(bundleZipData.title);
			this.form.get("artist")?.setValue(bundleZipData.artist);
			this.form.get("difficulty")?.setValue(difficulty);
			this.form.get("bpm")?.setValue(bundleZipData.bpm);
			this.form
				.get("isDeluxe")
				?.setValue(bundleZipData.type === "Promode");
			console.log("Bundle file decoded", this.form.value);
		} else {
			this.form.get("chartFileData")?.setErrors({ required: true });
		}
	}

	onSubmit() {
		this.formSubmitted = true;
		console.log("Form submitted", this.form.value);

		// Check if all required files are valid
		const hasFileErrors = this.info.inputs
			.filter((input): input is FileInput => input.type === "file")
			.some((input) => this.hasFileInputError(input));

		if (this.form.valid && !hasFileErrors) {
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
