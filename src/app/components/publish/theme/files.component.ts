import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	computed,
	inject,
} from "@angular/core";
import {
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Services
import { FormService, type FileFieldConfig } from "@/services/form.service";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import type { ThemeFormData } from "@/services/publish/handlers/theme-publish.handler";

@Component({
	selector: "app-publish-theme-files",
	template: `
		<h2 mat-dialog-title>Theme assets</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-3">
				<p>
					Upload the asset files for your theme. Each asset has
					specific dimension requirements.
				</p>

				@for (field of assetFields; track field.key) {
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
					[disabled]="!hasAtLeastOneFile()"
				>
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		FormsModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeFilesComponent implements OnInit {
	private formService = inject(FormService);

	dialogRef = inject<MatDialogRef<PublishThemeFilesComponent>>(MatDialogRef);
	data = inject<DialogData<ThemeFormData>>(MAT_DIALOG_DATA);

	form!: FormGroup;

	assetFields: FileFieldConfig[] = [
		this.formService.createFileField({
			key: "iconFile",
			label: "Icon",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			hint: "256x256 - Square icon used as the theme thumbnail",
		}),
		this.formService.createFileField({
			key: "trackFile",
			label: "Track",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			hint: "512x512 to 512x2048 - Track lane background",
		}),
		this.formService.createFileField({
			key: "topFile",
			label: "Top",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			hint: "512x256 - Top section of the track",
		}),
		this.formService.createFileField({
			key: "bottomFile",
			label: "Bottom",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			hint: "512x256 - Bottom section of the track",
		}),
		this.formService.createFileField({
			key: "circleFile",
			label: "Circle",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			hint: "256x256 - Hit circle asset",
		}),
		this.formService.createFileField({
			key: "perfectBarFile",
			label: "Perfect Bar",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			hint: "64x256 - Perfect timing bar",
		}),
		this.formService.createFileField({
			key: "perfectLineFile",
			label: "Perfect Line",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			hint: "512x32 - Perfect timing line",
		}),
	];

	getControl = computed(() => (key: string): FormControl => {
		const control = this.form.get(key) as FormControl | null;
		if (!(control instanceof FormControl)) {
			throw new Error(`Control with key "${key}" is not a FormControl`);
		}
		return control;
	});

	ngOnInit() {
		const initialData: Record<string, unknown> = {};
		for (const field of this.assetFields) {
			const value = this.data.formData?.[
				field.key as keyof ThemeFormData
			];
			initialData[field.key] = value instanceof File ? value : null;
		}

		this.form = this.formService.createFormGroup(
			this.assetFields,
			initialData,
		);
	}

	hasAtLeastOneFile(): boolean {
		return this.assetFields.some(
			(f) => this.form.get(f.key)?.value instanceof File,
		);
	}

	onSubmit() {
		if (this.form.invalid) return;
		this.dialogRef.close(this.form.value);
	}
}
