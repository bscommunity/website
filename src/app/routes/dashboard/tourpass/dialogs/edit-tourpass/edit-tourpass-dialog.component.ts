import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
	MAT_DIALOG_DATA,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import {
	TourPassDetailsFormComponent,
	TourPassDetailsValue,
} from "@/components/tourpass-details-form/tourpass-details-form.component";

// Services
import { TourPassService } from "@/services/api/tour-pass.service";

// Models
import { TourPassModel } from "@/models/tour-pass.model";

export interface EditTourPassDialogData {
	tourpass: TourPassModel;
}

@Component({
	selector: "app-edit-tourpass-dialog",
	template: `
		<app-tourpass-details-form
			title="Edit tour pass"
			description=""
			submitLabel="Save"
			cancelLabel="Cancel"
			[coverRequired]="false"
			[initialValues]="initialValues"
			[disabled]="isSaving"
			[requireDirty]="true"
			(canceled)="dialogRef.close()"
			(submitted)="onSubmitted($event)"
		/>
	`,
	imports: [TourPassDetailsFormComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTourPassDialogComponent {
	private tourPassService = inject(TourPassService);
	private _snackBar = inject(MatSnackBar);

	dialogRef =
		inject<MatDialogRef<EditTourPassDialogComponent>>(MatDialogRef);
	data = inject<EditTourPassDialogData>(MAT_DIALOG_DATA);

	isSaving = false;

	initialValues: Partial<TourPassDetailsValue> = {
		name: this.data.tourpass.name,
		description: this.data.tourpass.description || "",
		trailerUrl: this.data.tourpass.previewVideoId
			? `https://youtu.be/${this.data.tourpass.previewVideoId}`
			: "",
		coverFile: null,
	};

	async onSubmitted(value: TourPassDetailsValue): Promise<void> {
		this.isSaving = true;
		this.dialogRef.disableClose = true;

		try {
			const response = await this.tourPassService.updateTourPass(
				this.data.tourpass.id,
				{
					name: value.name,
					description: value.description || null,
					previewUrl: value.trailerUrl || null,
					coverFile: value.coverFile ?? null,
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
			this.dialogRef.disableClose = false;
		}
	}
}
