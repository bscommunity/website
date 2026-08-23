import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
} from "@angular/core";

import {
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

// Models
import { Difficulty, getDifficultyLabel } from "@/models/enums/difficulty.enum";

// Components
import { FormFieldComponent } from "@/components/form-field/form-field.component";

// Services
import {
	FormService,
	type ValuesToControls,
} from "@/services/form.service";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import { initialChartFormData as initialFormData } from "@/services/publish/handlers/chart-publish.handler";

interface ChartDetailsForm {
	track: string;
	artist: string;
	difficulty: Difficulty;
	isDeluxe: boolean;
	isExplicit: boolean;
}

@Component({
	selector: "app-publish-chart-details",
	template: `
		<h2 mat-dialog-title>{{ title }}</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-2">
				<p class="mb-2">
					{{ description }}
				</p>

				<app-form-field
					[control]="form.controls.track"
					[config]="fields.trackField"
				/>

				<app-form-field
					[control]="form.controls.artist"
					[config]="fields.artistField"
				/>

				<div class="flex flex-row items-center justify-between last">
					<app-form-field
						class="w-1/3"
						[control]="form.controls.difficulty"
						[config]="fields.difficultyField"
					/>
					<mat-slide-toggle
						labelPosition="before"
						[formControl]="form.controls.isDeluxe"
					>
						Is deluxe?
					</mat-slide-toggle>
					<mat-slide-toggle
						labelPosition="before"
						[formControl]="form.controls.isExplicit"
					>
						Is explicit?
					</mat-slide-toggle>
				</div>
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button
					mat-button
					type="button"
					(click)="dialogRef.close('back')"
				>
					Back
				</button>
				<button mat-button type="submit" [disabled]="form.invalid">
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatSlideToggleModule,
		FormsModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishChartDetailsComponent implements OnInit {
	private formService = inject(FormService);
	dialogRef =
		inject<MatDialogRef<PublishChartDetailsComponent>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	title = "Chart details";
	description =
		"Fill in the details for your chart submission. Make sure all the required fields are filled before proceeding.";

	difficulties = Object.values(Difficulty).map((difficulty) => ({
		value: difficulty,
		label: getDifficultyLabel(difficulty),
	}));

	readonly fields = {
		trackField: this.formService.createTextField({
			key: "track",
			label: "Title",
			placeholder: "We Live Forever",
			required: true,
			disabled: this.data.inactive?.includes("track"),
		}),
		artistField: this.formService.createTextField({
			key: "artist",
			label: "Artist",
			placeholder: "The Prodigy",
			required: true,
			disabled: this.data.inactive?.includes("artist"),
		}),
		difficultyField: this.formService.createSelectField({
			key: "difficulty",
			label: "Difficulty",
			options: this.difficulties,
			disabled: this.data.inactive?.includes("difficulty"),
		}),
	};

	private readonly allFields = [
		this.fields.trackField,
		this.fields.artistField,
		this.fields.difficultyField,
	] as const;

	form: FormGroup<ValuesToControls<ChartDetailsForm>>;

	constructor() {
		this.title = this.data.title || this.title;
		this.description = this.data.description || this.description;

		this.form = this.formService.createFormGroup<ChartDetailsForm>(
			this.allFields,
			{
				track: initialFormData.track,
				artist: initialFormData.artist,
				difficulty: initialFormData.difficulty,
			},
		);

		this.form.addControl(
			"isDeluxe",
			new FormControl(
				{ value: initialFormData.isDeluxe, disabled: false },
				{ nonNullable: true },
			),
		);
		this.form.addControl(
			"isExplicit",
			new FormControl(
				{ value: initialFormData.isExplicit, disabled: false },
				{ nonNullable: true },
			),
		);

		if (this.data.inactive?.includes("isDeluxe")) {
			this.form.controls.isDeluxe.disable();
		}
		if (this.data.inactive?.includes("isExplicit")) {
			this.form.controls.isExplicit.disable();
		}
	}

	ngOnInit() {
		// Initialize form with existing data
		this.form.patchValue(this.data.formData);
	}

	async onSubmit() {
		const result = await this.formService.submitForm<ChartDetailsForm>(
			this.allFields,
			this.form,
		);

		if (result.isValid) {
			this.dialogRef.close(result.formValue);
		}
	}
}