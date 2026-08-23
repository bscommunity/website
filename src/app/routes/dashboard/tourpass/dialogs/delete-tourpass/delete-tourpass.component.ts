import { Router } from "@angular/router";
import { Component, inject, signal } from "@angular/core";
import { FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

// Material
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Services
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";
import { TourPassService } from "@/services/api/tour-pass.service";

interface DeleteTourPassDialogData {
	id: string;
	name: string;
}

interface ConfirmDeleteForm {
	confirmName: string;
}

@Component({
	selector: "app-delete-tourpass-dialog",
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatProgressSpinnerModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	templateUrl: "./delete-tourpass.component.html",
})
export class DeleteTourPassComponent {
	private tourPassService = inject(TourPassService);
	private router = inject(Router);
	private formService = inject(FormService);

	readonly _matSnackBar = inject(MatSnackBar);
	readonly dialogRef = inject(MatDialogRef<DeleteTourPassComponent>);

	readonly data = inject<DeleteTourPassDialogData>(MAT_DIALOG_DATA);

	confirmField = this.formService.createTextField({
		key: "confirmName",
		label: "Tour pass name",
		placeholder: "Type tour pass name",
		required: true,
		validators: [
			Validators.pattern(new RegExp(escapeRegExp(this.data.name))),
		],
		validationMessages: {
			pattern: "Name must match exactly",
		},
	});

	form: FormGroup<ValuesToControls<ConfirmDeleteForm>> =
		this.formService.createFormGroup<ConfirmDeleteForm>(
			[this.confirmField],
			{},
		);

	readonly isLoading = signal(false);

	async onSubmit() {
		if (this.form.invalid) {
			return;
		}

		this.isLoading.update(() => true);
		this.form.disable();

		try {
			await this.tourPassService.deleteTourPass(this.data.id);

			this.dialogRef.close(false);
			this.router
				.navigate(["/dashboard/uploads"], { replaceUrl: true })
				.then(() => {
					requestAnimationFrame(() => window.scrollTo({ top: 0 }));
				});

			this._matSnackBar.open("Tour pass deleted successfully", "Dismiss", {
				duration: 2000,
			});
		} catch (error) {
			console.error("Failed to delete tour pass", error);
			this._matSnackBar.open("Failed to delete tour pass", "Dismiss", {
				duration: 3000,
			});
			this.dialogRef.close(false);
			this.isLoading.update(() => false);
			this.form.enable();
		}
	}
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}