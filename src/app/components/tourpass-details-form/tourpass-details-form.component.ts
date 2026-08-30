import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	input,
	output,
} from "@angular/core";
import {
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";

import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Services
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";
import { formValuesChanged } from "@/lib/compare";

export interface TourPassDetailsValue {
	name: string;
	description: string;
	trailerUrl: string;
	coverFile: File | null;
}

/**
 * Shared tour pass details form used by both the publish wizard step
 * (PublishTourPassDetailsComponent) and the edit dialog on the
 * tour pass details page.
 */
@Component({
	selector: "app-tourpass-details-form",
	template: `
		<h2 mat-dialog-title>{{ title() }}</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-4">
				@if (description()) {
					<p>{{ description() }}</p>
				}

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
					[disabled]="disabled()"
					(click)="canceled.emit()"
				>
					{{ cancelLabel() }}
				</button>
				<button
					mat-button
					type="submit"
					[disabled]="
						form.invalid || disabled() || (requireDirty() && !hasChanges())
					"
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
export class TourPassDetailsFormComponent implements OnInit {
	private formService = inject(FormService);
	private validationService = inject(ValidationService);

	readonly title = input("Tour pass details");
	readonly description = input(
		"Fill in the details for your tour pass submission. Make sure all the required fields are filled before proceeding.",
	);
	readonly initialValues = input<Partial<TourPassDetailsValue>>({});
	readonly coverRequired = input(true);
	readonly submitLabel = input("Continue");
	readonly cancelLabel = input("Back");
	readonly disabled = input(false);
	/** Disables submit until the user modifies any field (used by edit dialogs). */
	readonly requireDirty = input(false);

	readonly canceled = output<void>();
	readonly submitted = output<TourPassDetailsValue>();

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
			onValueProcessed: (value: string) =>
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

	form: FormGroup<ValuesToControls<TourPassDetailsValue>> =
		this.formService.createFormGroup<TourPassDetailsValue>(this.allFields, {
			name: "",
			description: "",
			trailerUrl: "",
			coverFile: null,
		});

	private initialValuesSnapshot: Record<string, unknown> = {};

	/** True when any field value differs from the initial snapshot. */
	hasChanges(): boolean {
		return formValuesChanged(
			this.initialValuesSnapshot,
			this.form.getRawValue(),
		);
	}

	ngOnInit(): void {
		const values = this.initialValues();
		this.form.patchValue({
			name: values.name ?? "",
			description: values.description ?? "",
			trailerUrl: values.trailerUrl ?? "",
			coverFile: values.coverFile ?? null,
		});

		if (!this.coverRequired()) {
			const control = this.form.controls.coverFile;
			control.clearValidators();
			control.updateValueAndValidity();
		}

		this.initialValuesSnapshot = this.form.getRawValue();
	}

	async onSubmit(): Promise<void> {
		const result = await this.formService.submitForm<TourPassDetailsValue>(
			this.allFields,
			this.form,
		);

		if (result.isValid) {
			this.submitted.emit(result.formValue);
		}
	}
}
