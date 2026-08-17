import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	signal,
} from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
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
import { NgGlyph } from "@ng-icons/core";

// Services
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

				<mat-form-field appearance="outline">
					<mat-label>Name</mat-label>
					<input
						matInput
						type="text"
						formControlName="name"
						placeholder="Chrome Skull"
					/>
					@if (
						form.get("name")?.hasError("required") &&
						form.get("name")?.touched
					) {
						<mat-error>Name is <strong>required</strong></mat-error>
					}
				</mat-form-field>

				<mat-form-field appearance="outline">
					<mat-label>Video preview</mat-label>
					<input
						matInput
						type="url"
						formControlName="previewUrl"
						placeholder="https://youtu.be/BY_XwvKogC8"
					/>
					@if (
						form.get("previewUrl")?.hasError("invalidVideoUrl") &&
						form.get("previewUrl")?.touched
					) {
						<mat-error>Must be a YouTube video URL</mat-error>
					}
				</mat-form-field>

				<div class="flex flex-row gap-4">
					<mat-form-field
						subscriptSizing="dynamic"
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
						subscriptSizing="dynamic"
						class="flex-1"
						appearance="outline"
					>
						<mat-label>Replaces</mat-label>
						<mat-select
							formControlName="replaces"
							[disabled]="!form.get('genre')?.value"
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

				<mat-form-field appearance="outline">
					<mat-label>Original artwork</mat-label>
					<input
						matInput
						type="text"
						formControlName="originalArtwork"
						placeholder="Credit or URL to the original artist"
					/>
				</mat-form-field>
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
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeDetailsComponent implements OnInit {
	private fb = inject(FormBuilder);
	private validationService = inject(ValidationService);

	dialogRef =
		inject<MatDialogRef<PublishThemeDetailsComponent>>(MatDialogRef);
	data = inject<DialogData<ThemeFormData>>(MAT_DIALOG_DATA);

	form: FormGroup;

	genres = THEME_GENRES.map((g) => ({
		value: g,
		label: THEME_GENRE_LABELS[g],
	}));

	availableThemes = signal<{ id: string; name: string }[]>([]);

	constructor() {
		this.form = this.fb.group({
			name: ["", Validators.required],
			previewUrl: [""],
			genre: ["", Validators.required],
			replaces: ["", Validators.required],
			originalArtwork: [""],
		});
	}

	ngOnInit() {
		this.form.patchValue({
			name: this.data.formData?.name ?? "",
			previewUrl: this.data.formData?.previewUrl ?? "",
			genre: this.data.formData?.genre ?? "",
			replaces: this.data.formData?.replaces ?? "",
			originalArtwork: this.data.formData?.originalArtwork ?? "",
		});

		if (this.data.formData?.genre) {
			this.onGenreChange();
		}
	}

	onGenreChange() {
		const genre = this.form.get("genre")?.value as ThemeGenre | null;
		if (genre) {
			this.availableThemes.set(getThemesByGenre(genre));
			const currentReplaces = this.form.get("replaces")?.value;
			const themes = getThemesByGenre(genre);
			if (currentReplaces && !themes.some((t) => t.id === currentReplaces)) {
				this.form.get("replaces")?.setValue("");
			}
		} else {
			this.availableThemes.set([]);
			this.form.get("replaces")?.setValue("");
		}
	}

	onSubmit() {
		if (this.form.invalid) return;

		const values = this.form.value;

		let previewUrl = values.previewUrl;
		if (previewUrl) {
			try {
				previewUrl = this.validationService.extractYouTubeVideoId(previewUrl);
			} catch {
				// Keep original value if extraction fails
			}
		}

		this.dialogRef.close({
			name: values.name,
			previewUrl: previewUrl || "",
			genre: values.genre,
			replaces: values.replaces,
			originalArtwork: values.originalArtwork || "",
		});
	}
}
