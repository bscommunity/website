import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	computed,
	inject,
	signal,
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
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Services
import { FormService } from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";

// Models
import { type DialogData } from "@/services/publish/publish.service";
import type { ThemeFormData } from "@/services/publish/handlers/theme-publish.handler";
import {
	THEME_GENRES,
	THEME_GENRE_LABELS,
	getThemesByGenre,
} from "@/models/theme/theme-genres";
import { ThemeGenre } from "@/models/theme/beatstar-themes";

@Component({
	selector: "app-publish-theme-details",
	template: `
		<h2 mat-dialog-title>Theme details</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-4">
				<p>
					Fill in the details for your theme submission. Make sure
					all the required fields are filled before proceeding.
				</p>

				<app-form-field
					[control]="getControl()('name')"
					[config]="fields.nameField"
				/>

				<app-form-field
					[control]="getControl()('displayFile')"
					[config]="fields.displayFileField"
				/>

				<app-form-field
					[control]="getControl()('previewUrl')"
					[config]="fields.previewUrlField"
				/>

				<div class="flex flex-row gap-4">
					<mat-form-field
						class="flex-1"
						appearance="outline"
					>
						<mat-label>Genre</mat-label>
						<mat-select formControlName="genre" (selectionChange)="onGenreChange()">
							@for (genre of genres; track genre.value) {
								<mat-option [value]="genre.value">
									{{ genre.label }}
								</mat-option>
							}
						</mat-select>
						@if (
							form.get("genre")?.hasError("required") &&
							form.get("genre")?.touched
						) {
							<mat-error>Genre is <strong>required</strong></mat-error>
						}
					</mat-form-field>

					<mat-form-field
						class="flex-1"
						appearance="outline"
					>
						<mat-label>Replaces</mat-label>
						<mat-select
							formControlName="replaces"
						>
							@for (theme of availableThemes(); track theme.id) {
								<mat-option [value]="theme.id">
									{{ theme.name }}
								</mat-option>
							}
						</mat-select>
						@if (
							form.get("replaces")?.hasError("required") &&
							form.get("replaces")?.touched
						) {
							<mat-error>Replaces is <strong>required</strong></mat-error>
						}
					</mat-form-field>
				</div>

				<app-form-field
					[control]="getControl()('originalArtwork')"
					[config]="fields.originalArtworkField"
				/>
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button
					mat-button
					type="button"
					(click)="dialogRef.close('back')"
				>
					Back
				</button>
				<button mat-button type="submit" [disabled]="form.invalid">
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		FormsModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeDetailsComponent implements OnInit {
	private formService = inject(FormService);
	private validationService = inject(ValidationService);

	dialogRef =
		inject<MatDialogRef<PublishThemeDetailsComponent>>(MatDialogRef);
	data = inject<DialogData<ThemeFormData>>(MAT_DIALOG_DATA);

	form!: FormGroup;

	genres = THEME_GENRES.map((g) => ({
		value: g,
		label: THEME_GENRE_LABELS[g],
	}));

	availableThemes = signal<{ id: string; name: string }[]>([]);

	readonly fields = {
		nameField: this.formService.createTextField({
			key: "name",
			label: "Name",
			placeholder: "Chrome Skull",
			required: true,
		}),
		previewUrlField: this.formService.createTextField({
			key: "previewUrl",
			label: "Video preview",
			inputType: "url",
			placeholder: "https://youtu.be/BY_XwvKogC8",
			required: false,
			hint: "Must be a YouTube video URL",
			onValueProcessed: (value) => {
				try {
					return this.validationService.extractYouTubeVideoId(value);
				} catch {
					return value;
				}
			},
		}),
		displayFileField: this.formService.createFileField({
			key: "displayFile",
			label: "Display art",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			required: true,
		}),
		originalArtworkField: this.formService.createTextField({
			key: "originalArtwork",
			label: "Original artwork",
			placeholder: "Credit or URL to the original artist",
			required: false,
		}),
	};

	textFields = [
		this.fields.nameField,
		this.fields.previewUrlField,
		this.fields.originalArtworkField,
	];

	getControl = computed(() => (key: string): FormControl => {
		const control = this.form.get(key) as FormControl | null;
		if (!(control instanceof FormControl)) {
			throw new Error(`Control with key "${key}" is not a FormControl`);
		}
		return control;
	});

	ngOnInit() {
		const initialData: Record<string, unknown> = {
			name: this.data.formData?.name ?? "",
			previewUrl: this.data.formData?.previewUrl ?? "",
			originalArtwork: this.data.formData?.originalArtwork ?? "",
			displayFile: this.data.formData?.displayFile ?? null,
		};

		const textAndFileFields = [
			this.fields.nameField,
			this.fields.previewUrlField,
			this.fields.displayFileField,
			this.fields.originalArtworkField,
		];

		this.form = this.formService.createFormGroup(
			textAndFileFields,
			initialData,
		);

		this.form.addControl(
			"genre",
			new FormControl(this.data.formData?.genre ?? null, { validators: [] }),
		);
		this.form.addControl(
			"replaces",
			new FormControl({ value: this.data.formData?.replaces ?? null, disabled: true }),
		);

		if (this.data.formData?.genre) {
			this.onGenreChange();
		}
	}

	onGenreChange() {
		const genre = this.form.get("genre")?.value as ThemeGenre | null;
		const replacesControl = this.form.get("replaces");
		if (genre) {
			this.availableThemes.set(getThemesByGenre(genre));
			replacesControl?.enable();
			const currentReplaces = replacesControl?.value;
			const themes = getThemesByGenre(genre);
			if (currentReplaces && !themes.some((t) => t.id === currentReplaces)) {
				replacesControl?.setValue("");
			}
		} else {
			this.availableThemes.set([]);
			replacesControl?.setValue("");
			replacesControl?.disable();
		}
	}

	async onSubmit() {
		const result = await this.formService.submitForm(
			this.form,
			[this.fields.nameField, this.fields.previewUrlField, this.fields.displayFileField, this.fields.originalArtworkField],
		);

		if (result.isValid && result.formValue) {
			const values = result.formValue as Record<string, unknown>;
			this.dialogRef.close({
				name: values["name"],
				previewUrl: values["previewUrl"] || "",
				genre: this.form.get("genre")?.value,
				replaces: this.form.get("replaces")?.value,
				originalArtwork: values["originalArtwork"] || "",
				displayFile: values["displayFile"] ?? null,
			});
		}
	}
}
