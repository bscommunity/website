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
import { FormService, type ValuesToControls } from "@/services/form.service";
import { ValidationService } from "@/services/validation.service";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { formValuesChanged } from "@/lib/compare";

export interface ChartDetailsValue {
	track: string;
	artist: string;
	difficulty: Difficulty;
	isDeluxe: boolean;
	isExplicit: boolean;
	/** YouTube URL/id - only rendered when `gameplayEditable()` is true. */
	gameplayUrl: string;
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

				@if (gameplayEditable()) {
					<app-form-field
						[control]="form.controls.gameplayUrl"
						[config]="fields.gameplayUrlField"
					/>
				}

				<app-form-field
					[control]="form.controls.difficulty"
					[config]="fields.difficultyField"
				/>
			<div
				class="flex flex-row items-center justify-start gap-4 -my-6"
			>
					<!-- <mat-slide-toggle
					labelPosition="before"
					[formControl]="form.controls.isDeluxe"
					>
					Deluxe
				</mat-slide-toggle> -->
					<mat-checkbox [formControl]="form.controls.isDeluxe">
						Deluxe
					</mat-checkbox>
					<mat-checkbox [formControl]="form.controls.isExplicit">
						Explicit lyrics
					</mat-checkbox>
				</div>
				<!-- <mat-slide-toggle
					labelPosition="before"
					[formControl]="form.controls.isExplicit"
				>
					Explicit content
				</mat-slide-toggle> -->
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
				[disabled]="
					form.invalid || disabled() || (requireDirty() && !hasChanges())
				"
			>
				{{ submitLabel() }}
			</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatCheckboxModule,
		MatSlideToggleModule,
		FormsModule,
		ReactiveFormsModule,
		FormFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartDetailsFormComponent implements OnInit {
	private formService = inject(FormService);
	private validationService = inject(ValidationService);

	readonly title = input("Chart details");
	readonly description = input(
		"Fill in the details for your chart submission. Make sure all the required fields are filled before proceeding.",
	);
	readonly initialValues = input<Partial<ChartDetailsValue>>({});
	/** Control keys that should be rendered as disabled/read-only. */
	readonly inactive = input<string[]>([]);
	/** Shows the gameplay video field (used by the edit dialog). */
	readonly gameplayEditable = input(false);
	readonly submitLabel = input("Continue");
	readonly cancelLabel = input("Back");
	readonly disabled = input(false);
	/** Disables submit until the user modifies any field (used by edit dialogs). */
	readonly requireDirty = input(false);

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
		gameplayUrlField: this.formService.createTextField({
			key: "gameplayUrl",
			label: "Gameplay video",
			placeholder: "https://youtu.be/BY_XwvKogC8",
			validators: [this.validationService.getYouTubeValidator()],
			validationMessages: {
				invalidVideoUrl:
					this.validationService.messages.invalidVideoUrl,
			},
			onValueProcessed: (value) =>
				this.validationService.extractYouTubeVideoId(value),
		}),
	};

	private readonly allFields = [
		this.fields.trackField,
		this.fields.artistField,
		this.fields.difficultyField,
	] as const;

	private readonly allFieldsWithGameplay = [
		...this.allFields,
		this.fields.gameplayUrlField,
	] as const;

	form: FormGroup<ValuesToControls<ChartDetailsValue>> =
		this.formService.createFormGroup<ChartDetailsValue>(
			this.allFieldsWithGameplay,
			{
				track: "",
				artist: "",
				difficulty: Difficulty.NORMAL,
			},
		);

	private initialValuesSnapshot: Record<string, unknown> = {};

	/** True when any field value differs from the initial snapshot. */
	hasChanges(): boolean {
		return formValuesChanged(
			this.initialValuesSnapshot,
			this.form.getRawValue(),
		);
	}

	ngOnInit(): void {
		this.form.addControl(
			"isDeluxe",
			new FormControl(
				{
					value: this.initialValues().isDeluxe ?? false,
					disabled: false,
				},
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
			gameplayUrl: values.gameplayUrl ?? "",
		});

		for (const key of this.inactive()) {
			const control = this.form.get(key);
			control?.disable();
		}

		// Snapshot after patching/disabling so the baseline matches what the
		// user sees on open.
		this.initialValuesSnapshot = this.form.getRawValue();
	}

	async onSubmit(): Promise<void> {
		const result = await this.formService.submitForm<ChartDetailsValue>(
			this.allFieldsWithGameplay,
			this.form,
		);

		if (result.isValid) {
			this.submitted.emit(result.formValue);
		}
	}
}
