import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	Input,
	computed,
} from "@angular/core";

import {
	FormBuilder,
	FormControl,
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
	type FormFieldConfig,
	type TextFieldConfig,
} from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Data
import { initialChartFormData } from "@/services/publish/handlers/chart-publish.handler";

// Types
import { type BundleZipData } from "@/services/extract.service";
import { type ChartFileData } from "@/services/decode.service";
import { type DialogData } from "@/services/publish/publish.service";

interface FormMode {
	title: string;
	description: string;
	fields: FormFieldConfig[];
}

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
						[control]="
							field.type === 'file'
								? formControls().file(field.key)
								: formControls().text(field.key)
						"
						[config]="field"
					/>
				}

				<!-- Disclaimer -->
				<app-panel>
					Your chart bundle
					<span class="font-medium">does not leaves the browser</span
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
		FormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishChartSourceComponent implements OnInit {
	dialogRef = inject<MatDialogRef<PublishChartSourceComponent>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	private formService = inject(FormService);

	form!: FormGroup;
	filesForm!: FormGroup;

	@Input() mode: "linking" | "uploading" = "linking";

	private readonly FIELDS = {
		chartFileField: this.formService.createFileField({
			key: "chartFile",
			label: "Chart file",
			accept: [".chart"],
			required: true,
			hint: "Upload your chart file (.chart)",
			onFileSelected: (file: File) => this.handleChartFile(file),
		}),
		chartBundleField: this.formService.createFileField({
			key: "bundleFile",
			label: "Bundle file",
			accept: [".zip"],
			required: true,
			hint: "Upload your chart bundle (.zip)",
			onFileSelected: (file: File) => this.handleBundleFile(file),
		}),
		gameplayUrlField: this.formService.createTextField({
			key: "chartPreviewUrl",
			label: "Gameplay",
			inputType: "url",
			placeholder: "https://youtu.be/BY_XwvKogC8",
			hint: "Must be a YouTube video URL",
			required: false,
			onValueProcessed: this.formService.extractYouTubeVideoId,
		}),
	};

	// Form modes configuration
	private readonly formModes: Record<string, FormMode> = {
		linking: {
			title: "Linking",
			description: "Provide the URL to your chart bundle.",
			fields: [
				this.formService.createTextField({
					key: "chartUrl",
					label: "Bundle",
					inputType: "url",
					placeholder: "https://example.com/chart.zip",
					hint: "Must be a direct link to the .zip file",
					required: true,
					urlFileExtension: "zip",
				}),
				this.FIELDS.chartFileField,
				this.FIELDS.gameplayUrlField,
			],
		},
		uploading: {
			title: "Uploading",
			description:
				"Upload your chart bundle to the Drive of your synced account.",
			fields: [
				this.FIELDS.chartBundleField,
				this.FIELDS.chartFileField,
				this.FIELDS.gameplayUrlField,
			],
		},
	};

	get formMode(): FormMode {
		return this.formModes[this.mode];
	}

	formControls = computed(() => ({
		file: (key: string) => this.filesForm.get(key) as FormControl,
		text: (key: string) => this.form.get(key) as FormControl,
	}));

	ngOnInit() {
		// Initialize form controls based on the provided data
		if ((this.data as any).mode) {
			this.mode = (this.data as any).mode;
		}

		this.form = this.formService.createFormGroup(
			this.formMode.fields,
			initialChartFormData,
		);

		this.filesForm = this.formService.createFormGroup(
			[this.FIELDS.chartFileField, this.FIELDS.chartBundleField],
			{},
		);

		this.form.patchValue(this.data.formData);
	}

	/**
	 * Handle chart file selection and processing
	 */
	private handleChartFile(file: File): void {
		// Here you would typically process the file to extract ChartFileData
		// For now, we'll just log it
		console.log("Chart file selected:", file.name);
		// TODO: Implement file processing logic
	}

	/**
	 * Handle bundle file selection and processing
	 */
	private handleBundleFile(file: File): void {
		// Here you would typically process the file to extract BundleZipData
		// For now, we'll just log it
		console.log("Bundle file selected:", file.name);
		// TODO: Implement file processing logic
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
		console.log("Trying to submit form");

		if (this.form.valid) {
			console.log("Form is valid, submitting...");
			const formValue = { ...this.form.value };

			// Process YouTube URL if provided
			if (formValue.chartPreviewUrl) {
				const textField = this.formModes[this.mode].fields.find(
					(field) =>
						field.type === "text" &&
						field.key === "chartPreviewUrl",
				) as TextFieldConfig;

				if (textField?.onValueProcessed) {
					formValue.chartPreviewUrl = textField.onValueProcessed(
						formValue.chartPreviewUrl,
					);
				}
			}

			this.dialogRef.close(formValue);
		} else {
			Object.keys(this.form.controls).forEach((key) => {
				const control = this.form.get(key);
				if (control?.errors === null) return;
				console.log(`${key}: errors:`, control?.errors);
			});

			Object.keys(this.filesForm.controls).forEach((key) => {
				const control = this.filesForm.get(key);
				if (control?.errors === null) return;
				console.log(`${key}: errors:`, control?.errors);
			});

			console.error("Form is invalid, cannot submit.");
		}
	}
}
