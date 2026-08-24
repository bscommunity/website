import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
	MAT_DIALOG_DATA,
	MatDialogRef,
} from "@angular/material/dialog";

// Components
import {
	TourPassDetailsFormComponent,
	TourPassDetailsValue,
} from "@/components/tourpass-details-form/tourpass-details-form.component";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import type { TourPassFormData } from "@/services/publish/handlers/tourpass-publish.handler";

/**
 * Wizard step wrapper around the shared tour pass details form.
 * Translates the shared component's outputs into the wizard's
 * dialog protocol ("back" / form data result).
 */
@Component({
	selector: "app-publish-tourpass-details",
	template: `
		<app-tourpass-details-form
			[initialValues]="initialValues"
			[coverRequired]="!data.formData.coverUrl"
			(canceled)="dialogRef.close('back')"
			(submitted)="onSubmitted($event)"
		/>
	`,
	imports: [TourPassDetailsFormComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishTourPassDetailsComponent {
	dialogRef =
		inject<MatDialogRef<PublishTourPassDetailsComponent>>(MatDialogRef);
	data = inject<DialogData<TourPassFormData>>(MAT_DIALOG_DATA);

	initialValues: Partial<TourPassDetailsValue> = {
		name: this.data.formData?.name ?? "",
		description: this.data.formData?.description ?? "",
		trailerUrl: this.data.formData?.trailerUrl ?? "",
		coverFile: this.data.formData?.coverFile ?? null,
	};

	async onSubmitted(value: TourPassDetailsValue): Promise<void> {
		const coverUrl = value.coverFile
			? await this.fileToDataUrl(value.coverFile)
			: this.data.formData?.coverUrl || "";

		this.dialogRef.close({
			...value,
			coverUrl,
		});
	}

	private fileToDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result || ""));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}
}
