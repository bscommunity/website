import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
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
				<label id="chart-flow-group">
					Start fresh with a new chart or link to one that already
					exists
				</label>
				<mat-radio-group
					aria-labelledby="chart-flow-group"
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
								<mat-icon>{{ option.icon }}</mat-icon>
								{{ option.label }}
							</span>
						</mat-radio-button>
					}
				</mat-radio-group>
				<app-panel>
					You can also
					<button (click)="dialogRef.close()">
						<a
							[routerLink]="['/settings']"
							[queryParams]="{ section: 'connections' }"
							class="underline cursor-pointer hover:text-white transition-colors"
							>connect your bscm account to Google Drive</a
						>
					</button>
					to directly upload files there!
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
		MatIconModule,
		MatRadioModule,
		FormsModule,
		RouterLink,
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
