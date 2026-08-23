import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import {
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef } from "@angular/material/dialog";

// Services
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";

interface ContentTypeForm {
	contentType: string;
}

@Component({
	selector: "app-publish-type",
	template: `
		<h2 mat-dialog-title>Submit</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography">
				<p id="content-type-group">
					Choose the type of content you'd like to submit.
				</p>
				<mat-radio-group
					aria-labelledby="content-type-group"
					class="flex items-start flex-col my-4"
					[formControl]="form.controls.contentType"
				>
					@for (type of contentTypes; track type; let i = $index) {
						<mat-radio-button
							class="m-1 w-full"
							[value]="type"
							[disabled]="disabledTypes.has(type)"
						>
							{{ type }}
						</mat-radio-button>
					}
				</mat-radio-group>
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button type="button" mat-button (click)="dialogRef.close()">
					Cancel
				</button>
				<button
					type="submit"
					mat-button
					[disabled]="!form.controls.contentType.value"
				>
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatRadioModule,
		FormsModule,
		ReactiveFormsModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishTypeComponent {
	private formService = inject(FormService);
	dialogRef = inject<MatDialogRef<PublishTypeComponent>>(MatDialogRef);

	contentTypes: string[] = ["Chart", "Tourpass", "Theme"];
	readonly disabledTypes = new Set<string>();

	contentTypeField = this.formService.createSelectField({
		key: "contentType",
		label: "Content type",
		options: this.contentTypes.map((type) => ({
			value: type,
			label: type,
		})),
		required: true,
	});

	form: FormGroup<ValuesToControls<ContentTypeForm>> =
		this.formService.createFormGroup<ContentTypeForm>(
			[this.contentTypeField],
			{},
		);

	onSubmit() {
		if (this.form.valid) {
			this.dialogRef.close({
				contentType: this.form.controls.contentType.value,
			});
		}
	}
}