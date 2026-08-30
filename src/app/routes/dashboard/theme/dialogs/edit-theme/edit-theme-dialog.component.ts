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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

// Services
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";
import { ThemeService } from "@/services/api/theme.service";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Models
import { ThemeModel } from "@/models/theme.model";
import {
	THEME_GENRES,
	THEME_GENRE_LABELS,
	getBeatstarTheme,
	getBeatstarThemeGenre,
	getThemesByGenre,
} from "@/models/theme/theme-genres";
import { ThemeGenre } from "@/models/theme/beatstar-themes";
import { formValuesChanged } from "@/lib/compare";

export interface EditThemeDialogData {
	theme: ThemeModel;
}

interface EditThemeForm {
	name: string;
	displayFile: File | null;
	previewUrl: string;
	originalArtwork: string;
	genre: ThemeGenre | null;
	replaces: string | null;
}

@Component({
	selector: "app-edit-theme-dialog",
	templateUrl: "./edit-theme-dialog.component.html",
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		FormsModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditThemeDialogComponent implements OnInit {
	private formService = inject(FormService);
	private validationService = inject(ValidationService);
	private themeService = inject(ThemeService);
	private _snackBar = inject(MatSnackBar);

	dialogRef = inject<MatDialogRef<EditThemeDialogComponent>>(MatDialogRef);
	data = inject<EditThemeDialogData>(MAT_DIALOG_DATA);

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
			hint: "A 9x16 portrait image is recommended.",
		}),
		previewUrlField: this.formService.createTextField({
			key: "previewUrl",
			label: "Video preview",
			placeholder: "https://youtu.be/BY_XwvKogC8",
			required: false,
			hint: "Must be a YouTube video URL",
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
			onChange: () =>
				this.updateReplacesOptions(this.form.controls.genre.value),
		}),
		replacesField: this.formService.createSelectField({
			key: "replaces",
			label: "Replaces",
			placeholder: "Select a theme to replace",
			options: [],
			disabled: true,
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

	form: FormGroup<ValuesToControls<EditThemeForm>> =
		this.formService.createFormGroup<EditThemeForm>(this.allFields, {
			name: this.data.theme.name,
			displayFile: null,
			previewUrl: this.data.theme.previewUrl
				? `https://youtu.be/${this.data.theme.previewUrl}`
				: "",
			originalArtwork: this.data.theme.originalArtwork ?? "",
			genre: getBeatstarThemeGenre(this.data.theme.replaces) ?? null,
			replaces: getBeatstarTheme(this.data.theme.replaces)?.id ?? this.data.theme.replaces,
		});

	isSaving = false;

	private initialValuesSnapshot: Record<string, unknown> = {};

	/** True when any field value differs from the initial snapshot. */
	hasChanges(): boolean {
		return formValuesChanged(
			this.initialValuesSnapshot,
			this.form.getRawValue(),
		);
	}

	availableThemes = signal<{ id: string; name: string }[]>([]);

	replacesOptions = computed(() =>
		this.availableThemes().map((theme) => ({
			value: theme.id,
			label: theme.name,
		})),
	);

	ngOnInit(): void {
		const genre = this.form.controls.genre.value;
		if (genre) {
			// Preserve the current replaces value on initial load
			this.updateReplacesOptions(genre, true);
		}

		// Snapshot after normalization so the baseline matches what the user
		// sees on open.
		this.initialValuesSnapshot = this.form.getRawValue();
	}

	updateReplacesOptions(
		genre: ThemeGenre | null,
		preserveValue = false,
	): void {
		const replaces = this.form.controls.replaces;

		if (genre) {
			this.availableThemes.set(getThemesByGenre(genre));
			replaces.enable();

			const current = replaces.value;
			if (
				!preserveValue &&
				current &&
				!this.availableThemes().some((t) => t.id === current)
			) {
				replaces.setValue(null);
			}
		} else {
			this.availableThemes.set([]);
			replaces.setValue(null);
			replaces.disable();
		}
	}

	async onSubmit(): Promise<void> {
		const result = await this.formService.submitForm<EditThemeForm>(
			this.allFields,
			this.form,
		);

		if (!result.isValid) return;

		this.isSaving = true;
		this.dialogRef.disableClose = true;

		try {
			const v = result.formValue;

			let previewUrl = v.previewUrl?.trim() || "";
			if (previewUrl) {
				try {
					previewUrl =
						this.validationService.extractYouTubeVideoId(previewUrl);
				} catch {
					// Keep the raw value; the API will reject it if invalid
				}
			}

			const response = await this.themeService.updateTheme(
				this.data.theme.id,
				{
					name: v.name,
					replaces: v.replaces ?? "",
					previewUrl: previewUrl || null,
					originalArtwork: v.originalArtwork || null,
					displayFile: v.displayFile ?? null,
				},
			);

			this._snackBar.open("Theme updated successfully", "Close", {
				duration: 2000,
			});

			this.dialogRef.close(response);
		} catch (error) {
			console.error("Failed to update theme", error);
			this._snackBar.open("Failed to update theme", "Close", {
				duration: 3000,
			});
			this.isSaving = false;
			this.dialogRef.disableClose = false;
		}
	}
}
