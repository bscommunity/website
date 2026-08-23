import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
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
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import {
	initialTourPassFormData,
	type TourPassFormData,
} from "@/services/publish/handlers/tourpass-publish.handler";

interface TourPassDetailsForm {
	name: string;
	description: string;
	trailerUrl: string;
	coverFile: File | null;
}

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

				<app-form-field
					[control]="form.controls.name"
					[config]="fields.nameField"
				/>

				<app-form-field
					[control]="form.controls.description"
					[config]="fields.descriptionField"
				/>

				<app-form-field
					[control]="form.controls.trailerUrl"
					[config]="fields.trailerUrlField"
				/>

				<app-form-field
					[control]="form.controls.coverFile"
					[config]="fields.coverFileField"
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
export class PublishTourPassDetailsComponent implements OnInit {
	private formService = inject(FormService);
	private validationService = inject(ValidationService);

	dialogRef =
		inject<MatDialogRef<PublishTourPassDetailsComponent>>(MatDialogRef);
	data = inject<DialogData<TourPassFormData>>(MAT_DIALOG_DATA);

	readonly fields = {
		nameField: this.formService.createTextField({
			key: "name",
			label: "Name",
			placeholder: "Festival Afterglow",
			required: true,
		}),
		descriptionField: this.formService.createTextField({
			key: "description",
			label: "Description",
			multiline: true,
			placeholder: "A bright setlist of festival-ready charts.",
		}),
		trailerUrlField: this.formService.createTextField({
			key: "trailerUrl",
			label: "Trailer",
			placeholder: "https://youtu.be/BY_XwvKogC8",
			validators: [this.validationService.getYouTubeValidator()],
			validationMessages: {
				invalidVideoUrl:
					this.validationService.messages.invalidVideoUrl,
			},
			onValueProcessed: (value) =>
				this.validationService.extractYouTubeVideoId(value),
		}),
		coverFileField: this.formService.createFileField({
			key: "coverFile",
			label: "Cover art",
			required: true,
			accept: [".png", ".jpeg", ".jpg", ".avif", ".webp"],
			hint: "Accepted formats: .png, .jpeg, .avif, .webp",
		}),
	};

	private readonly allFields = [
		this.fields.nameField,
		this.fields.descriptionField,
		this.fields.trailerUrlField,
		this.fields.coverFileField,
	] as const;

	form: FormGroup<ValuesToControls<TourPassDetailsForm>> =
		this.formService.createFormGroup<TourPassDetailsForm>(
			this.allFields,
			{
				name: initialTourPassFormData.name,
				description: initialTourPassFormData.description ?? "",
				trailerUrl: initialTourPassFormData.trailerUrl ?? "",
				coverFile: initialTourPassFormData.coverFile ?? null,
			},
		);

	ngOnInit() {
		this.form.patchValue({
			name: this.data.formData.name ?? "",
			description: this.data.formData.description ?? "",
			trailerUrl: this.data.formData.trailerUrl ?? "",
			coverFile: this.data.formData.coverFile ?? null,
		});

		if (this.data.formData.coverUrl) {
			const control = this.form.controls.coverFile;
			control.clearValidators();
			control.updateValueAndValidity();
		}
	}

	async onSubmit() {
		const result = await this.formService.submitForm<TourPassDetailsForm>(
			this.allFields,
			this.form,
		);

		if (!result.isValid) return;

		const v = result.formValue;
		const coverUrl = v.coverFile
			? await this.fileToDataUrl(v.coverFile)
			: this.data.formData.coverUrl || "";

		this.dialogRef.close({
			...v,
			coverUrl,
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