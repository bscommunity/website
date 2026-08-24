import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	input,
	output,
} from "@angular/core";

import {
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatDialogModule } from "@angular/material/dialog";
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

export interface ChartDetailsValue {
	track: string;
	artist: string;
	difficulty: Difficulty;
	isDeluxe: boolean;
	isExplicit: boolean;
}

/**
 * Shared chart details form used by both the publish wizard step
 * (PublishChartDetailsComponent) and the edit dialog on the chart
 * details page.
 */
@Component({
	selector: "app-chart-details-form",
	template: `
		<h2 mat-dialog-title>{{ title() }}</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-2">
				@if (description()) {
					<p class="mb-2">{{ description() }}</p>
				}

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
					[disabled]="disabled()"
					(click)="canceled.emit()"
				>
					{{ cancelLabel() }}
				</button>
				<button
					mat-button
					type="submit"
					[disabled]="form.invalid || disabled()"
				>
					{{ submitLabel() }}
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
export class ChartDetailsFormComponent implements OnInit {
	private formService = inject(FormService);

	readonly title = input("Chart details");
	readonly description = input(
		"Fill in the details for your chart submission. Make sure all the required fields are filled before proceeding.",
	);
	readonly initialValues = input<Partial<ChartDetailsValue>>({});
	/** Control keys that should be rendered as disabled/read-only. */
	readonly inactive = input<string[]>([]);
	readonly submitLabel = input("Continue");
	readonly cancelLabel = input("Back");
	readonly disabled = input(false);

	readonly canceled = output<void>();
	readonly submitted = output<ChartDetailsValue>();

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
		}),
		artistField: this.formService.createTextField({
			key: "artist",
			label: "Artist",
			placeholder: "The Prodigy",
			required: true,
		}),
		difficultyField: this.formService.createSelectField({
			key: "difficulty",
			label: "Difficulty",
			options: this.difficulties,
		}),
	};

	private readonly allFields = [
		this.fields.trackField,
		this.fields.artistField,
		this.fields.difficultyField,
	] as const;

	form: FormGroup<ValuesToControls<ChartDetailsValue>> =
		this.formService.createFormGroup<ChartDetailsValue>(this.allFields, {
			track: "",
			artist: "",
			difficulty: Difficulty.NORMAL,
		});

	ngOnInit(): void {
		this.form.addControl(
			"isDeluxe",
			new FormControl(
				{ value: this.initialValues().isDeluxe ?? false, disabled: false },
				{ nonNullable: true },
			),
		);
		this.form.addControl(
			"isExplicit",
			new FormControl(
				{
					value: this.initialValues().isExplicit ?? false,
					disabled: false,
				},
				{ nonNullable: true },
			),
		);

		const values = this.initialValues();
		this.form.patchValue({
			track: values.track ?? "",
			artist: values.artist ?? "",
			difficulty: values.difficulty ?? Difficulty.NORMAL,
			isDeluxe: values.isDeluxe ?? false,
			isExplicit: values.isExplicit ?? false,
		});

		for (const key of this.inactive()) {
			const control = this.form.get(key);
			control?.disable();
		}
	}

	async onSubmit(): Promise<void> {
		const result = await this.formService.submitForm<ChartDetailsValue>(
			this.allFields,
			this.form,
		);

		if (result.isValid) {
			this.submitted.emit(result.formValue);
		}
	}
}
