import { Router } from "@angular/router";
import { Component, inject, signal } from "@angular/core";
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
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
import { MatFormField } from "@angular/material/form-field";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";

// Services
import { ThemeService } from "@/services/api/theme.service";

interface DeleteThemeDialogData {
	id: string;
	name: string;
}

@Component({
	selector: "app-delete-theme-dialog",
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatInputModule,
		MatProgressSpinnerModule,
		MatFormField,
		ReactiveFormsModule,
	],
	templateUrl: "./delete-theme.component.html",
})
export class DeleteThemeComponent {
	private themeService = inject(ThemeService);
	private router = inject(Router);
	private viewportScroller = inject(ViewportScroller);

	readonly _matSnackBar = inject(MatSnackBar);
	readonly dialogRef = inject(MatDialogRef<DeleteThemeComponent>);

	readonly data = inject<DeleteThemeDialogData>(MAT_DIALOG_DATA);

	form = new FormGroup({
		themeName: new FormControl("", [
			Validators.required,
			Validators.pattern(new RegExp(escapeRegExp(this.data.name))),
		]),
	});

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
