import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	computed,
	inject,
	input,
	output,
} from "@angular/core";
import {
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";

import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Services
import { FormService, type ValuesToControls } from "@/services/form.service";

export const THEME_ASSET_FILE_KEYS = [
	"iconFile",
	"trackFile",
	"topFile",
	"bottomFile",
	"circleFile",
	"perfectBarFile",
	"perfectLineFile",
] as const;

export type ThemeAssetFileKey = (typeof THEME_ASSET_FILE_KEYS)[number];

export type ThemeAssetFilesValue = Record<ThemeAssetFileKey, File | null>;

/**
 * Shared individual asset files form used by both the theme publish
 * wizard and the publish new version flow. Only reached when the
 * batch upload step was skipped. Emits the full raw form value so
 * cleared fields are reported as `null`.
 */
@Component({
	selector: "app-theme-assets-files-form",
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
					[disabled]="disabled()"
					(click)="back.emit()"
				>
					Back
				</button>
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-flat-button
					type="submit"
					[disabled]="!hasAtLeastOneFile() || disabled()"
				>
					{{ submitLabel() }}
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
export class ThemeAssetsFilesFormComponent implements OnInit {
	private formService = inject(FormService);

	readonly disabled = input(false);
	readonly initialValues = input<
		Partial<Record<ThemeAssetFileKey, File>>
	>({});
	readonly submitLabel = input("Continue");

	readonly back = output<void>();
	readonly submitted = output<ThemeAssetFilesValue>();

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
	] as const;

	form!: FormGroup<ValuesToControls<ThemeAssetFilesValue>>;

	getControl = computed(
		() =>
			(key: string): FormControl =>
				this.form.controls[key as ThemeAssetFileKey],
	);

	ngOnInit(): void {
		// Built here (not in a field initializer) because input signals
		// cannot be read before the framework applies the first bindings.
		this.form = this.formService.createFormGroup<ThemeAssetFilesValue>(
			this.assetFields,
			this.initialValues(),
		);
	}

	hasAtLeastOneFile(): boolean {
		return Object.values(this.form.controls).some(
			(control) => control.value instanceof File,
		);
	}

	onSubmit() {
		if (this.form.invalid) return;
		this.submitted.emit(this.form.getRawValue());
	}
}
