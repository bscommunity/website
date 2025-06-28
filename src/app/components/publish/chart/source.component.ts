import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	Input,
} from "@angular/core";

import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
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
import { MatFormFieldModule } from "@angular/material/form-field";

// Models
import { Difficulty } from "@/models/enums/difficulty.enum";

// Services
import {
	FormService,
	FormMode,
	TextFieldConfig,
} from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";

// Components
import { DynamicFormFieldComponent } from "@/components/form-field/form-field.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Data
import { initialChartFormData } from "@/services/publish/handlers/chart-publish.handler";

// Types
import { type BundleZipData } from "@/services/extract.service";
import { type ChartFileData } from "@/services/decode.service";
import { type DialogData } from "@/services/publish/publish.service";

@Component({
	selector: "app-publish-chart-source",
	template: `
		<h2 mat-dialog-title>
			{{ formMode.title }}
		</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography !flex flex-col gap-4">
				<p class="mb-2">
					{{ formMode.description }} Ensure your file meets the
					submission guidelines.
				</p>

				<!-- Dynamic form fields -->
				@for (field of formMode.fields; track field.key) {
					<app-form-field
						[config]="field"
						[formGroup]="form"
						[showValidation]="formSubmitted"
					/>
				}

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
		MatSelectModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSlideToggleModule,
		ReactiveFormsModule,
		PanelComponent,
		DynamicFormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishChartSourceComponent implements OnInit {
	dialogRef = inject<MatDialogRef<PublishChartSourceComponent>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	private fb = inject(FormBuilder);
	private formService = inject(FormService);
	private validationService = inject(ValidationService);

	form!: FormGroup;
	formSubmitted = false;

	@Input() mode: "linking" | "uploading" = "linking";

	// Form modes configuration
	private readonly formModes: Record<string, FormMode> = {
		linking: {
			title: "Linking",
			description: "Provide the URL to your chart bundle.",
			fields: [
				this.formService.createUrlField(
					"bundle-url",
					"Bundle",
					"chartUrl",
					{
						placeholder: "https://example.com/chart.zip",
						hint: "Must be a direct link to the .zip file",
						required: true,
						fileExtension: "zip",
						validationMessages: {
							required: "URL is <strong>required</strong>",
							invalidUrl: "Please enter a valid URL",
							notHttps: "Please enter a valid URL",
							invalidFileUrl: "URL must point to a .zip file",
						},
					},
				),
				this.formService.createUrlField(
					"gameplay-url",
					"Gameplay",
					"chartPreviewUrl",
					{
						placeholder: "https://youtu.be/BY_XwvKogC8",
						hint: "Must be a YouTube video URL",
						required: false,
						videoUrl: true,
						processValue: this.formService.extractYouTubeVideoId,
						validationMessages: {
							invalidUrl: "Please enter a valid URL",
							notHttps: "Please enter a valid URL",
							invalidVideoUrl: "Must be a YouTube video URL",
						},
					},
				),
			],
		},
		uploading: {
			title: "Uploading",
			description:
				"Upload your chart bundle to the Drive of your synced account.",
			fields: [
				this.formService.createFileField(
					"bundle-file",
					"Bundle file",
					[".zip"],
					(data: BundleZipData, formGroup: FormGroup) =>
						this.processBundleFile(data, formGroup),
					{ required: true, hint: "Upload your chart bundle (.zip)" },
				),
				this.formService.createFileField(
					"chart-file",
					"Chart file",
					[".chart"],
					(data: ChartFileData, formGroup: FormGroup) =>
						this.processChartFile(data, formGroup),
					{ required: true, hint: "Upload your chart file (.chart)" },
				),
				this.formService.createUrlField(
					"gameplay-url",
					"Gameplay",
					"chartPreviewUrl",
					{
						placeholder: "https://youtu.be/BY_XwvKogC8",
						hint: "Must be a YouTube video URL",
						required: false,
						videoUrl: true,
						processValue: this.formService.extractYouTubeVideoId,
						validationMessages: {
							invalidUrl: "Please enter a valid URL",
							notHttps: "Please enter a valid URL",
							invalidVideoUrl: "Must be a YouTube video URL",
						},
					},
				),
			],
		},
	};

	get formMode(): FormMode {
		return this.formModes[this.mode];
	}

	constructor() {
		this.initializeForm();
	}

	private initializeForm(): void {
		this.form = this.fb.group({
			chartUrl: [
				initialChartFormData.chartUrl,
				[
					Validators.required,
					this.validationService.createUrlValidator(),
					this.validationService.getZipValidator(),
				],
			],
			chartPreviewUrl: [
				initialChartFormData.chartPreviewUrl,
				[
					this.validationService.createUrlValidator(),
					this.validationService.getYouTubeValidator(),
				],
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

	/**
	 * Process bundle file data and update form fields
	 */
	private processBundleFile(
		bundleZipData: BundleZipData | null,
		formGroup: FormGroup,
	): void {
		if (!bundleZipData) return;

		let difficulty: Difficulty;
		switch (bundleZipData.difficulty) {
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

		formGroup.patchValue({
			track: bundleZipData.title,
			artist: bundleZipData.artist,
			difficulty: difficulty,
			bpm: bundleZipData.bpm,
			isDeluxe: bundleZipData.type === "Promode",
		});
	}

	/**
	 * Process chart file data and update form fields
	 */
	private processChartFile(
		chartFileData: ChartFileData | null,
		formGroup: FormGroup,
	): void {
		if (!chartFileData) return;

		formGroup.patchValue({
			notesAmount: chartFileData.notesAmount,
			effectsAmount: chartFileData.effectsAmount,
			bpm: chartFileData.bpm,
			duration: chartFileData.duration,
		});
	}

	onSubmit() {
		this.formSubmitted = true;

		if (this.form.valid) {
			const formValue = { ...this.form.value };

			// Process YouTube URL if provided
			if (formValue.chartPreviewUrl) {
				const textField = this.formModes[this.mode].fields.find(
					(field) =>
						field.type === "text" &&
						(field as TextFieldConfig).formControlName ===
							"chartPreviewUrl",
				) as TextFieldConfig;

				if (textField?.processValue) {
					formValue.chartPreviewUrl = textField.processValue(
						formValue.chartPreviewUrl,
					);
				}
			}

			this.dialogRef.close(formValue);
		}
	}
}
