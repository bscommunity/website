import { Router } from "@angular/router";
import { Component, inject, signal } from "@angular/core";
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";

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
import { TourPassService } from "@/services/api/tour-pass.service";

interface DeleteTourPassDialogData {
	id: string;
	name: string;
}

@Component({
	selector: "app-delete-tourpass-dialog",
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
	templateUrl: "./delete-tourpass.component.html",
})
export class DeleteTourPassComponent {
	private tourPassService = inject(TourPassService);
	private router = inject(Router);

	readonly _matSnackBar = inject(MatSnackBar);
	readonly dialogRef = inject(MatDialogRef<DeleteTourPassComponent>);

	readonly data = inject<DeleteTourPassDialogData>(MAT_DIALOG_DATA);

	form = new FormGroup({
		tourPassName: new FormControl("", [
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
