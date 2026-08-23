import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	Input,
	computed,
} from "@angular/core";

// Material
import {
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
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

// Services
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Data
import { initialChartFormData } from "@/services/publish/handlers/chart-publish.handler";

// Types
import { type DialogData } from "@/services/publish/publish.service";

interface SourceDialogData extends DialogData {
	mode?: "linking" | "uploading";
}

interface ChartSourceFormValues {
	chartBundle: File | null;
	previewUrl: string;
	bundleUrl: string;
}

@Component({
	selector: "app-publish-chart-source",
	template: `
		<h2 mat-dialog-title>
			{{ formMode.title }}
		</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-4">
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
			</mat-dialog-content>
			<mat-dialog-actions align="center" class="gap-2">
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-button
					type="button"
					(click)="dialogRef.close('back')"
				>
					Back
				</button>
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-flat-button
					type="submit"
				>
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
		FormFieldComponent,
		// PanelComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishChartSourceComponent implements OnInit {
	dialogRef = inject<MatDialogRef<PublishChartSourceComponent>>(MatDialogRef);
	data = inject<SourceDialogData>(MAT_DIALOG_DATA);

	private formService = inject(FormService);
	private validationService = inject(ValidationService);

	form!: FormGroup<ValuesToControls<ChartSourceFormValues>>;
	@Input() mode: "linking" | "uploading" = "linking";

	getControl = computed(() => (key: string): FormControl => {
		return this.form.controls[key as keyof ChartSourceFormValues];
	});

	private readonly FIELDS = {
		chartBundleField: this.formService.createFileField({
			key: "chartBundle",
			label: "Bundle file",
			accept: [".zip"],
			required: true,
			hint: "Must be a .zip file",
		}),
		gameplayUrlField: this.formService.createTextField({
			key: "previewUrl",
			label: "Gameplay",
			inputType: "url",
			placeholder: "https://youtu.be/BY_XwvKogC8",
			hint: "Must be a direct link to a YouTube video",
			required: false,
			onValueProcessed: this.validationService.extractYouTubeVideoId,
		}),
		bundleUrlField: this.formService.createTextField({
			key: "bundleUrl",
			label: "Bundle",
			inputType: "url",
			placeholder: "https://example.com/chart.zip",
			hint: "Must be a direct link to the .zip file",
			required: true,
			urlFileExtension: "zip",
		}),
	};

	// Form modes configuration
	private readonly formModes = {
		linking: {
			title: "Linking",
			description: "Provide the URL to your chart bundle.",
			fields: [this.FIELDS.bundleUrlField, this.FIELDS.gameplayUrlField],
		},
		uploading: {
			title: "Uploading",
			description: "Upload your chart bundle to Discord's workshop.",
			fields: [this.FIELDS.chartBundleField, this.FIELDS.gameplayUrlField],
		},
	};

	get formMode() {
		return this.formModes[this.mode];
	}

	ngOnInit() {
		// Initialize form controls based on the provided data
		if (
			this.data.mode &&
			(this.data.mode === "linking" || this.data.mode === "uploading")
		) {
			this.mode = this.data.mode;
		}

		this.form =
			this.formService.createFormGroup<ChartSourceFormValues>(
				this.formMode.fields,
				initialChartFormData,
			);

		this.form.patchValue(this.data.formData);
	}

	async onSubmit() {
		const result = await this.formService.submitForm<ChartSourceFormValues>(
			this.formMode.fields,
			this.form,
		);

		if (result.isValid) {
			console.log(
				"Form submitted successfully with value:",
				result.formValue,
			);
			this.dialogRef.close(result.formValue);
		}
	}
}
