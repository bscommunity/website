import { Router } from "@angular/router";
import { Component, inject, signal } from "@angular/core";
import { FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ViewportScroller } from "@angular/common";

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
import { ThemeService } from "@/services/api/theme.service";

interface DeleteThemeDialogData {
	id: string;
	name: string;
}

interface ConfirmDeleteForm {
	confirmName: string;
}

@Component({
	selector: "app-delete-theme-dialog",
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
	templateUrl: "./delete-theme.component.html",
})
export class DeleteThemeComponent {
	private themeService = inject(ThemeService);
	private router = inject(Router);
	private viewportScroller = inject(ViewportScroller);
	private formService = inject(FormService);

	readonly _matSnackBar = inject(MatSnackBar);
	readonly dialogRef = inject(MatDialogRef<DeleteThemeComponent>);

	readonly data = inject<DeleteThemeDialogData>(MAT_DIALOG_DATA);

	confirmField = this.formService.createTextField({
		key: "confirmName",
		label: "Theme name",
		placeholder: "Type theme name",
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

		const response = await this.themeService.deleteTheme(this.data.id);

		if (response) {
			this.dialogRef.close(false);
			this.router
				.navigate(["/dashboard/uploads"], { replaceUrl: true })
				.then(() => this.viewportScroller.scrollToPosition([0, 0]));

			this._matSnackBar.open("Theme deleted successfully", "Dismiss", {
				duration: 2000,
			});
		} else {
			console.error("Failed to delete theme", response);
			this._matSnackBar.open("Failed to delete theme", "Dismiss", {
				duration: 2000,
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