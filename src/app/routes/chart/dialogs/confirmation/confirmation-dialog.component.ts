import { Component, inject, signal } from "@angular/core";

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

export interface ConfirmationDialogData {
	title: string;
	description: string;
	operation: () => Promise<void>;
	afterOperation?: () => void;
}

@Component({
	selector: "app-confirmation-dialog",
	templateUrl: "./confirmation-dialog.component.html",
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatProgressSpinnerModule,
		MatDialogContent,
		MatDialogActions,
	],
})
export class ConfirmationDialogComponent {
	readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
	readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
	readonly _matSnackBar = inject(MatSnackBar);

	readonly isLoading = signal(false);

	async onSubmit(): Promise<void> {
		this.isLoading.set(true);

		try {
			await this.data.operation();
			this.data.afterOperation && this.data.afterOperation();
		} catch (error) {
			console.error(error);
			this._matSnackBar.open("An error occurred", "Close");
		}

		this.isLoading.set(false);
		this.dialogRef.close();
	}

	onCancel(): void {
		this.dialogRef.close();
	}
}
