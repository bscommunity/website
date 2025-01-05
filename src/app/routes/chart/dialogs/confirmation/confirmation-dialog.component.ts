import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";

export interface DialogData {
	title: string;
	description: string;
}

@Component({
	selector: "app-confirmation-dialog",
	templateUrl: "./confirmation-dialog.component.html",
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
	],
})
export class ConfirmationDialogComponent {
	readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
