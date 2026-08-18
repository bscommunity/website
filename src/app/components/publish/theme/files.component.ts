import {
	ChangeDetectionStrategy,
	Component,
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
import { FormService, type ValuesToControls } from "@/services/form.service";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import type { ThemeFormData } from "@/services/publish/handlers/theme-publish.handler";

interface ThemeFilesForm {
	iconFile: File | null;
	trackFile: File | null;
	topFile: File | null;
	bottomFile: File | null;
	circleFile: File | null;
	perfectBarFile: File | null;
	perfectLineFile: File | null;
}

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
export class PublishThemeFilesComponent {
	private formService = inject(FormService);

	dialogRef = inject<MatDialogRef<PublishThemeFilesComponent>>(MatDialogRef);
	data = inject<DialogData<ThemeFormData>>(MAT_DIALOG_DATA);

	readonly assetFields = [
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

	form: FormGroup<ValuesToControls<ThemeFilesForm>> =
		this.formService.createFormGroup<ThemeFilesForm>(
			this.assetFields,
			this.initialData(),
		);

	getControl = computed(
		() =>
			(key: string): FormControl =>
				this.form.controls[key as keyof ThemeFilesForm],
	);

	private initialData(): Partial<ThemeFilesForm> {
		const initialData: Partial<ThemeFilesForm> = {};
		for (const field of this.assetFields) {
			const value = this.data.formData?.[
				field.key as keyof ThemeFormData
			];
			if (value instanceof File) {
				initialData[field.key as keyof ThemeFilesForm] = value;
			}
		}
		return initialData;
	}

	hasAtLeastOneFile(): boolean {
		return Object.values(this.form.controls).some(
			(control) => control.value instanceof File,
		);
	}

	onSubmit() {
		if (this.form.invalid) return;
		this.dialogRef.close(this.form.getRawValue());
	}
}