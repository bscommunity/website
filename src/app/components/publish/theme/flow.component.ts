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
import { NgGlyph } from "@ng-icons/core";
import { MatDialogRef } from "@angular/material/dialog";

import { PanelComponent } from "@/components/panel/panel.component";

interface Option {
	icon: string;
	label: string;
	value: string;
	disabled?: boolean;
}

@Component({
	selector: "app-publish-theme-flow",
	template: `
		<h2 mat-dialog-title>Start here</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography">
				<p class="mb-4">
					Start fresh with a new theme or link to one that already
					exists
				</p>
				<mat-radio-group
					aria-label="Theme flow options"
					class="flex items-start flex-col gap-1 my-4"
					formControlName="themeFlow"
				>
					@for (option of options; track option; let i = $index) {
						<mat-radio-button
							labelPosition="before"
							class="m-1 w-full flex items-center justify-between rounded-sm border border-outline pr-5"
							[value]="option.value"
							[disabled]="option.disabled"
						>
							<span
								class="flex flex-1 pl-5 py-5 items-center justify-start gap-3 w-full"
							>
								<ng-glyph [name]="option.icon" />
								{{ option.label }}
							</span>
						</mat-radio-button>
					}
				</mat-radio-group>
				<app-panel variant="info">
					You can create a new theme from scratch by providing the
					asset files and metadata.
				</app-panel>
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button
					type="button"
					mat-button
					(click)="dialogRef.close('back')"
				>
					Back
				</button>
				<button
					type="submit"
					mat-button
					[disabled]="!form.get('themeFlow')?.value"
				>
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		NgGlyph,
		MatRadioModule,
		FormsModule,
		ReactiveFormsModule,
		PanelComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeFlowComponent {
	private fb = inject(FormBuilder);
	dialogRef = inject<MatDialogRef<PublishThemeFlowComponent>>(MatDialogRef);

	form: FormGroup = this.fb.group({
		themeFlow: "new",
	});

	options: Option[] = [
		{ icon: "add", label: "Create a new theme", value: "new" },
		{
			icon: "file_export",
			label: "Link to an existing theme",
			value: "existing",
			disabled: true,
		},
	];

	onSubmit() {
		if (this.form.valid) {
			this.dialogRef.close({
				data: this.form.value,
				additionalData: {
					mode: this.form.value.themeFlow,
				},
			});
		}
	}
}
