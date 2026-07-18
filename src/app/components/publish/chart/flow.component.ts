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
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

// Components
import { PanelComponent } from "@/components/panel/panel.component";

// Types
import { type DialogData } from "@/services/publish/publish.service";

interface Option {
	icon: string;
	label: string;
	value: string;
}

@Component({
	selector: "app-publish-chart-flow",
	template: `
		<h2 mat-dialog-title>Start here</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography">
				<p class="mb-4">
					Start fresh with a new chart or link to one that already
					exists
				</p>
				<mat-radio-group
					aria-label="Chart flow options"
					class="flex items-start flex-col gap-1 my-4"
					formControlName="chartFlow"
				>
					@for (option of options; track option; let i = $index) {
						<mat-radio-button
							labelPosition="before"
							class="m-1 w-full flex items-center justify-between rounded-sm border border-outline pr-5"
							[value]="option.value"
							[disabled]="i === 0"
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
				<app-panel>
					Please visit
					<button (click)="dialogRef.close()">
						<a
							href="http://143.110.226.4:3001/encrypt"
							target="_blank"
							class="underline cursor-pointer hover:text-black dark:hover:text-white transition-colors"
							>External's website</a
						>
					</button>
					to create new chart bundles
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
					[disabled]="!form.get('chartFlow')?.value"
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
export class PublishChartFlowComponent {
	private fb = inject(FormBuilder);
	dialogRef = inject<MatDialogRef<PublishChartFlowComponent>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	form: FormGroup = this.fb.group({
		chartFlow: "",
	});

	options: Option[] = [
		{ icon: "add", label: "Create a new chart", value: "new" },
		{
			icon: "file_export",
			label: "Link to an existing chart",
			value: "existing",
		},
	];
	selectedOption: Option | null = null;

	test = 1;

	onSubmit() {
		if (this.form.valid) {
			this.dialogRef.close({
				data: this.form.value,
				additionalData: {
					mode: "uploading",
				},
			});
		}
	}
}
