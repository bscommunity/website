import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
} from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

// Services
import { FormService, type FormFieldConfig } from "@/services/form.service";
import { TourPassService } from "@/services/api/tour-pass.service";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Models
import { TourPassModel } from "@/models/tour-pass.model";

export interface EditTourPassDialogData {
	tourpass: TourPassModel;
}

@Component({
	selector: "app-edit-tourpass-dialog",
	template: `
		<h2 mat-dialog-title>Edit tour pass</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-4">
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
		MatFormFieldModule,
		MatInputModule,
		MatProgressSpinnerModule,
		FormsModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTourPassDialogComponent implements OnInit {
	private fb = inject(FormBuilder);
	private formService = inject(FormService);
	private tourPassService = inject(TourPassService);
	private _snackBar = inject(MatSnackBar);

	dialogRef =
		inject<MatDialogRef<EditTourPassDialogComponent>>(MatDialogRef);
	data = inject<EditTourPassDialogData>(MAT_DIALOG_DATA);

	form: FormGroup;
	isSaving = false;

	coverField: FormFieldConfig = this.formService.createFileField({
		key: "coverFile",
		label: "Cover art",
		required: false,
		accept: [".png", ".jpeg", ".jpg", ".avif", ".webp"],
		hint: "Accepted formats: .png, .jpeg, .avif, .webp",
	});

	constructor() {
		this.form = this.fb.group({
			name: [this.data.tourpass.name, Validators.required],
			description: [this.data.tourpass.description || ""],
			coverFile: [null],
		});
	}

	get coverControl(): FormControl {
		return this.form.get("coverFile") as FormControl;
	}

	ngOnInit() {
		if (this.data.tourpass.coverUrl) {
			const control = this.form.get("coverFile");
			control?.clearValidators();
			control?.updateValueAndValidity();
		}
	}

	async onSubmit() {
		if (this.form.invalid) return;

		this.isSaving = true;

		try {
			const values = this.form.value;
			const coverFile = values.coverFile as File | null;

			const result = await this.tourPassService.updateTourPass(
				this.data.tourpass.id,
				{
					name: values.name,
					description: values.description || null,
					coverFile: coverFile ?? null,
				},
			);

			this._snackBar.open("Tour pass updated successfully", "Close", {
				duration: 2000,
			});

			this.dialogRef.close(result);
		} catch (error) {
			console.error("Failed to update tour pass", error);
			this._snackBar.open("Failed to update tour pass", "Close", {
				duration: 3000,
			});
			this.isSaving = false;
		}
	}
}
