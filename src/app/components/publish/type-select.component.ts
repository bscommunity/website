import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { initialFormData, type DialogData } from "@/services/publish.service";

@Component({
	selector: "app-publish-dialog-type-select",
	template: `
		<h2 mat-dialog-title>Submit</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography">
				<label id="content-type-group">
					Choose the type of content you'd like to submit.
				</label>
				<mat-radio-group
					aria-labelledby="content-type-group"
					class="flex items-start flex-col my-4"
					formControlName="contentType"
				>
					@for (type of contentTypes; track type; let i = $index) {
						<mat-radio-button
							class="m-1"
							[value]="type"
							[disabled]="i !== 0"
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
					[disabled]="!form.get('contentType')?.value"
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
export class PublishDialogTypeSelectComponent {
	private fb = inject(FormBuilder);
	dialogRef =
		inject<MatDialogRef<PublishDialogTypeSelectComponent>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	form: FormGroup = this.fb.group({
		contentType: "",
	});

	contentTypes: string[] = ["Chart", "Tourpass", "Theme"];
	currentContentType: string = "Chart";

	onSubmit() {
		if (this.form.valid) {
			this.dialogRef.close({
				...this.data.formData,
				...this.form.value,
			});
		}
	}
}
