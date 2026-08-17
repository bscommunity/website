import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
} from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
	ValidatorFn,
	FormControl,
} from "@angular/forms";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";

// Services
import { FormService, type FormFieldConfig } from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import {
	initialTourPassFormData,
	type TourPassFormData,
} from "@/services/publish/handlers/tourpass-publish.handler";

@Component({
	selector: "app-publish-tourpass-details",
	template: `
		<h2 mat-dialog-title>Tour pass details</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-4">
				<p>
					Fill in the details for your tour pass submission. Make sure
					all the required fields are filled before proceeding.
				</p>

				<mat-form-field appearance="outline">
					<mat-label>Name</mat-label>
					<input
						matInput
						type="text"
						formControlName="name"
						placeholder="Festival Afterglow"
					/>
					@if (
						form.get("name")?.hasError("required") &&
						form.get("name")?.touched
					) {
						<mat-error>Name is <strong>required</strong></mat-error>
					}
				</mat-form-field>

				<mat-form-field appearance="outline">
					<mat-label>Description</mat-label>
					<textarea
						matInput
						rows="2"
						formControlName="description"
						placeholder="A bright setlist of festival-ready charts."
					></textarea>
				</mat-form-field>

				<mat-form-field appearance="outline">
					<mat-label>Trailer</mat-label>
					<input
						matInput
						type="url"
						formControlName="trailerUrl"
						placeholder="https://youtu.be/BY_XwvKogC8"
					/>
					@if (
						form.get("trailerUrl")?.hasError("invalidVideoUrl") &&
						form.get("trailerUrl")?.touched
					) {
						<mat-error>Must be a YouTube video URL</mat-error>
					}
				</mat-form-field>

				<app-form-field
					[control]="coverControl"
					[config]="coverField"
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
		FormsModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishTourPassDetailsComponent implements OnInit {
	private fb = inject(FormBuilder);
	private formService = inject(FormService);
	private validationService = inject(ValidationService);

	dialogRef =
		inject<MatDialogRef<PublishTourPassDetailsComponent>>(MatDialogRef);
	data = inject<DialogData<TourPassFormData>>(MAT_DIALOG_DATA);

	form: FormGroup;
	coverField: FormFieldConfig = this.formService.createFileField({
		key: "coverFile",
		label: "Cover art",
		required: true,
		accept: [".png", ".jpeg", ".jpg", ".avif", ".webp"],
		hint: "Accepted formats: .png, .jpeg, .avif, .webp",
	});

	constructor() {
		const trailerValidator: ValidatorFn = (control) => {
			if (!control.value) return null;
			try {
				this.validationService.extractYouTubeVideoId(control.value);
				return null;
			} catch {
				return { invalidVideoUrl: true };
			}
		};

		this.form = this.fb.group({
			name: [initialTourPassFormData.name, Validators.required],
			description: [initialTourPassFormData.description],
			trailerUrl: [
				initialTourPassFormData.trailerUrl,
				[trailerValidator],
			],
			coverFile: [initialTourPassFormData.coverFile, Validators.required],
		});
	}

	get coverControl(): FormControl {
		return this.form.get("coverFile") as FormControl;
	}

	ngOnInit() {
		this.form.patchValue(this.data.formData);
		if (this.data.formData.coverUrl) {
			const control = this.form.get("coverFile");
			control?.clearValidators();
			control?.updateValueAndValidity();
		}
	}

	async onSubmit() {
		if (this.form.invalid) return;

		const values = this.form.value as TourPassFormData;
		const coverFile = values.coverFile as File | null;
		const coverUrl = coverFile
			? await this.fileToDataUrl(coverFile)
			: this.data.formData.coverUrl || "";

		const trailerUrl = values.trailerUrl
			? this.validationService.extractYouTubeVideoId(values.trailerUrl)
			: "";

		this.dialogRef.close({
			...values,
			coverUrl,
			trailerUrl,
		});
	}

	private fileToDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result || ""));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}
}
