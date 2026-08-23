import {
	ChangeDetectionStrategy,
	Component,
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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

// Services
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";
import { TourPassService } from "@/services/api/tour-pass.service";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Models
import { TourPassModel } from "@/models/tour-pass.model";

export interface EditTourPassDialogData {
	tourpass: TourPassModel;
}

interface EditTourPassForm {
	name: string;
	description: string;
	coverFile: File | null;
}

@Component({
	selector: "app-edit-tourpass-dialog",
	template: `
		<h2 mat-dialog-title>Edit tour pass</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-4">
				<app-form-field
					[control]="form.controls.name"
					[config]="fields.nameField"
				/>

				<app-form-field
					[control]="form.controls.description"
					[config]="fields.descriptionField"
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
					[disabled]="isSaving"
				>
					Cancel
				</button>
				<button mat-button type="submit" [disabled]="form.invalid || isSaving">
					@if (isSaving) {
						<mat-progress-spinner
							[diameter]="16"
							mode="indeterminate"
						></mat-progress-spinner>
					} @else {
						Save
					}
				</button>
			</mat-dialog-actions>
		</form>
	`,
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
export class EditTourPassDialogComponent {
	private formService = inject(FormService);
	private tourPassService = inject(TourPassService);
	private _snackBar = inject(MatSnackBar);

	dialogRef =
		inject<MatDialogRef<EditTourPassDialogComponent>>(MatDialogRef);
	data = inject<EditTourPassDialogData>(MAT_DIALOG_DATA);

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
		coverFileField: this.formService.createFileField({
			key: "coverFile",
			label: "Cover art",
			accept: [".png", ".jpeg", ".jpg", ".avif", ".webp"],
			hint: "Accepted formats: .png, .jpeg, .avif, .webp",
		}),
	};

	private readonly allFields = [
		this.fields.nameField,
		this.fields.descriptionField,
		this.fields.coverFileField,
	] as const;

	form: FormGroup<ValuesToControls<EditTourPassForm>> =
		this.formService.createFormGroup<EditTourPassForm>(this.allFields, {
			name: this.data.tourpass.name,
			description: this.data.tourpass.description || "",
			coverFile: null,
		});

	isSaving = false;

	async onSubmit() {
		const result = await this.formService.submitForm<EditTourPassForm>(
			this.allFields,
			this.form,
		);

		if (!result.isValid) return;

		this.isSaving = true;

		try {
			const v = result.formValue;

			const response = await this.tourPassService.updateTourPass(
				this.data.tourpass.id,
				{
					name: v.name,
					description: v.description || null,
					coverFile: v.coverFile ?? null,
				},
			);

			this._snackBar.open("Tour pass updated successfully", "Close", {
				duration: 2000,
			});

			this.dialogRef.close(response);
		} catch (error) {
			console.error("Failed to update tour pass", error);
			this._snackBar.open("Failed to update tour pass", "Close", {
				duration: 3000,
			});
			this.isSaving = false;
		}
	}
}