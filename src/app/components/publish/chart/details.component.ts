import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
	MAT_DIALOG_DATA,
	MatDialogRef,
} from "@angular/material/dialog";

// Components
import {
	ChartDetailsFormComponent,
	ChartDetailsValue,
} from "@/components/chart-details-form/chart-details-form.component";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import { initialChartFormData } from "@/services/publish/handlers/chart-publish.handler";

/**
 * Wizard step wrapper around the shared chart details form.
 * Translates the shared component's outputs into the wizard's
 * dialog protocol ("back" / form data result).
 */
@Component({
	selector: "app-publish-chart-details",
	template: `
		<app-chart-details-form
			[title]="data.title || defaultTitle"
			[description]="data.description || defaultDescription"
			[inactive]="data.inactive ?? []"
			[initialValues]="initialValues"
			(canceled)="dialogRef.close('back')"
			(submitted)="onSubmitted($event)"
		/>
	`,
	imports: [ChartDetailsFormComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishChartDetailsComponent {
	dialogRef =
		inject<MatDialogRef<PublishChartDetailsComponent>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly defaultTitle = "Chart details";
	readonly defaultDescription =
		"Fill in the details for your chart submission. Make sure all the required fields are filled before proceeding.";

	private readonly formData =
		this.data.formData as Partial<ChartDetailsValue> | undefined;

	initialValues: Partial<ChartDetailsValue> = {
		track: this.formData?.track ?? initialChartFormData.track,
		artist: this.formData?.artist ?? initialChartFormData.artist,
		difficulty:
			this.formData?.difficulty ?? initialChartFormData.difficulty,
		isDeluxe: this.formData?.isDeluxe ?? initialChartFormData.isDeluxe,
		isExplicit:
			this.formData?.isExplicit ?? initialChartFormData.isExplicit,
	};

	onSubmitted(value: ChartDetailsValue): void {
		this.dialogRef.close(value);
	}
}
