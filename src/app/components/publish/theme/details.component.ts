import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	computed,
	inject,
	signal,
} from "@angular/core";
import {
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
import { ValidationService } from "@/services/validation.service";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import type { ThemeFormData } from "@/services/publish/handlers/theme-publish.handler";

// Models
import {
	THEME_GENRES,
	THEME_GENRE_LABELS,
	getThemesByGenre,
} from "@/models/theme/theme-genres";
import { ThemeGenre } from "@/models/theme/beatstar-themes";

interface ThemeDetailsForm {
	name: string;
	displayFile: File | null;
	previewUrl: string;
	originalArtwork: string;
	genre: ThemeGenre | null;
	replaces: string | null;
}

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
					[control]="form.controls.name"
					[config]="fields.nameField"
				/>

				<app-form-field
					[control]="form.controls.displayFile"
					[config]="fields.displayFileField"
				/>

				<app-form-field
					[control]="form.controls.previewUrl"
					[config]="fields.previewUrlField"
				/>

				<div class="flex flex-row gap-4">
					<app-form-field
						class="flex-1"
						[control]="form.controls.genre"
						[config]="fields.genreField"
					/>

					<app-form-field
						class="flex-1"
						[control]="form.controls.replaces"
						[config]="fields.replacesField"
						[options]="replacesOptions()"
					/>
				</div>

				<app-form-field
					[control]="form.controls.originalArtwork"
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

	readonly fields = {
		nameField: this.formService.createTextField({
			key: "name",
			label: "Name",
			placeholder: "Chrome Skull",
			required: true,
		}),
		displayFileField: this.formService.createFileField({
			key: "displayFile",
			label: "Display art",
			accept: [".png", ".jpg", ".jpeg", ".webp"],
			required: true,
			hint: "A 9x16 portrait image is recommended.",
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
		originalArtworkField: this.formService.createTextField({
			key: "originalArtwork",
			label: "Original artwork",
			placeholder: "Credit or URL to the original artist",
			required: false,
		}),
		genreField: this.formService.createSelectField({
			key: "genre",
			label: "Genre",
			placeholder: "Select a genre",
			options: THEME_GENRES.map((genre) => ({
				value: genre,
				label: THEME_GENRE_LABELS[genre],
			})),
			onChange: () => this.onGenreChange(),
		}),
		replacesField: this.formService.createSelectField({
			key: "replaces",
			label: "Replaces",
			placeholder: "Select a theme to replace",
			options: [],
			disabled: true,
			onChange: () => this.onGenreChange(),
		}),
	};

	private readonly allFields = [
		this.fields.nameField,
		this.fields.displayFileField,
		this.fields.previewUrlField,
		this.fields.originalArtworkField,
		this.fields.genreField,
		this.fields.replacesField,
	] as const;

	form: FormGroup<ValuesToControls<ThemeDetailsForm>> =
		this.formService.createFormGroup<ThemeDetailsForm>(this.allFields, {
			name: this.data.formData?.name ?? "",
			displayFile: this.data.formData?.displayFile ?? null,
			previewUrl: this.data.formData?.previewUrl ?? "",
			originalArtwork: this.data.formData?.originalArtwork ?? "",
			genre: (this.data.formData?.genre ?? null) as ThemeGenre | null,
			replaces: this.data.formData?.replaces ?? null,
		});

	availableThemes = signal<{ id: string; name: string }[]>([]);

	replacesOptions = computed(() =>
		this.availableThemes().map((theme) => ({
			value: theme.id,
			label: theme.name,
		})),
	);

	ngOnInit() {
		if (this.data.formData?.genre) {
			this.onGenreChange();
		}
	}

	onGenreChange() {
		const genre = this.form.controls.genre.value;
		const replaces = this.form.controls.replaces;
		if (genre) {
			const themes = getThemesByGenre(genre);
			this.availableThemes.set(themes);
			replaces.enable();
			if (replaces.value && !themes.some((t) => t.id === replaces.value)) {
				replaces.setValue(null);
			}
		} else {
			this.availableThemes.set([]);
			replaces.setValue(null);
			replaces.disable();
		}
	}

	async onSubmit() {
		const result = await this.formService.submitForm<ThemeDetailsForm>(
			this.allFields,
			this.form,
		);

		if (result.isValid) {
			const v = result.formValue;
			this.dialogRef.close({
				name: v.name,
				displayFile: v.displayFile,
				previewUrl: v.previewUrl || "",
				genre: v.genre ?? "",
				replaces: v.replaces ?? "",
				originalArtwork: v.originalArtwork || "",
			});
		}
	}
}