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
import { DecodeService } from "@/services/decode.service";
import { ExtractService, type BundleZipData } from "@/services/extract.service";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Data
import { initialChartFormData } from "@/services/publish/handlers/chart-publish.handler";

// Types
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
	private decodeService = inject(DecodeService);

	private formService = inject(FormService);

	form!: FormGroup;
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
		}),
		chartBundleField: this.formService.createFileField({
			key: "bundleFile",
			label: "Bundle file",
			accept: [".zip"],
			required: true,
			hint: "Upload your chart bundle (.zip)",
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

	async onSubmit() {
		const result = await this.formService.submitForm(
			this.form,
			this.formMode.fields,
		);

		if (result.isValid && result.formValue) {
			console.log(
				"Form submitted successfully with value:",
				result.formValue,
			);
			this.dialogRef.close(result.formValue);
		}
	}
}
