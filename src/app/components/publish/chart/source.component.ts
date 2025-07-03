import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	Input,
	computed,
	signal,
	ViewChild,
} from "@angular/core";

import {
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	NgForm,
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
import { FormService, type FormFieldConfig } from "@/services/form.service";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Data
import { initialChartFormData } from "@/services/publish/handlers/chart-publish.handler";

// Types
import { ExtractService, type BundleZipData } from "@/services/extract.service";
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
						[control]="getControl()(field.key)"
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

	private extractService = inject(ExtractService);
	private formService = inject(FormService);

	form!: FormGroup;
	submitted = signal(false); // Keep this for manual tracking

	@Input() mode: "linking" | "uploading" = "linking";

	getControl = computed(() => (key: string): FormControl => {
		const control = this.form.get(key) as FormControl | null;
		if (!(control instanceof FormControl)) {
			throw new Error(`Control with key "${key}" is not a FormControl`);
		}
		return control;
	});

	private readonly FIELDS = {
		chartFileField: this.formService.createFileField({
			key: "chartFile",
			label: "Chart file",
			accept: [".chart"],
			required: true,
			hint: "Upload your chart file (.chart)",
			onFileSelected: (chartFileData: ChartFileData) =>
				this.processChartFile(chartFileData, this.form),
		}),
		chartBundleField: this.formService.createFileField({
			key: "bundleFile",
			label: "Bundle file",
			accept: [".zip"],
			required: true,
			hint: "Upload your chart bundle (.zip)",
			onFileSelected: (bundleFileData: BundleZipData) =>
				this.processBundleFile(bundleFileData, this.form),
		}),
		gameplayUrlField: this.formService.createTextField({
			key: "chartPreviewUrl",
			label: "Gameplay",
			inputType: "url",
			placeholder: "https://youtu.be/BY_XwvKogC8",
			hint: "Must be a YouTube video URL",
			required: true,
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

	ngOnInit() {
		// Initialize form controls based on the provided data
		if ((this.data as any).mode) {
			this.mode = (this.data as any).mode;
		}

		this.form = this.formService.createFormGroup(
			this.formMode.fields,
			initialChartFormData,
		);

		this.form.patchValue(this.data.formData);
	}

	private async processBundleUrl(
		bundleUrl: string | null,
		formGroup: FormGroup,
	): Promise<void> {
		if (!bundleUrl) return;

		try {
			const bundleZipData: BundleZipData | null =
				await this.extractService.fetchBundleZip(bundleUrl);
			if (bundleZipData) {
				this.processBundleFile(bundleZipData, formGroup);
			} else {
				console.error("Failed to fetch bundle zip data.");
				throw new Error(
					`Failed to fetch bundle zip from URL: ${bundleUrl}`,
				);
			}
		} catch (error) {
			console.error("Error fetching bundle zip:", error);
			throw new Error(
				`Failed to fetch bundle zip from URL: ${bundleUrl}`,
			);
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
		console.log("Trying to submit form");

		// Mark form as submitted to show validation errors
		this.submitted.set(true);

		if (this.form.valid) {
			console.log("Form is valid, submitting...");
			let formValue = { ...this.form.value };

			// Process YouTube URL if provided
			this.formService.processTextFieldValues(
				this.form,
				this.formMode.fields,
			);

			// If current mode is linking, process the bundle URL
			if (this.mode === "linking") {
				const chartUrl = this.form.get("chartUrl")?.value;
				if (chartUrl) {
					this.processBundleUrl(chartUrl, this.form)
						.then(() => {
							console.log("Bundle URL processed successfully.");
						})
						.catch((error) => {
							console.error(
								"Error processing bundle URL:",
								error,
							);
						});
				}
			}

			// Update form value after processing
			// This is necessary to ensure all fields are correctly set
			formValue = { ...this.form.value };

			console.log("Form value to submit:", formValue);

			// this.dialogRef.close(formValue);
		} else {
			Object.keys(this.form.controls).forEach((key) => {
				const control = this.form.get(key);
				if (control?.errors === null) return;
				console.log(
					`${key}: errors:`,
					control?.errors,
					control?.invalid,
				);
				control?.markAsTouched(); // Triggers validation messages
				control?.markAsDirty(); // Ensures the control is marked as dirty
			});

			console.error("Form is invalid, cannot submit.");
		}
	}
}
