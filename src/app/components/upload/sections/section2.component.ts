import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	OnInit,
} from "@angular/core";

import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";

import {
	initialFormData,
	UploadFormData,
} from "../../../services/upload.service";
import { Difficulty, getDifficultyLabel } from "@/models/enums/difficulty.enum";

@Component({
	selector: "app-upload-dialog-section2",
	template: `
		<h2 mat-dialog-title>Chart details</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography !flex flex-col gap-2">
				<p class="mb-2">
					Fill in the details for your chart submission. Make sure all
					the required fields are filled before proceeding
				</p>

				<mat-form-field appearance="outline">
					<mat-label>Title</mat-label>
					<input
						type="text"
						matInput
						formControlName="track"
						placeholder="We Live Forever"
					/>
					@if (
						form.get("track")?.hasError("required") &&
						form.get("track")?.touched
					) {
						<mat-error
							>Track is <strong>required</strong></mat-error
						>
					}
				</mat-form-field>

				<mat-form-field appearance="outline">
					<mat-label>Artist</mat-label>
					<input
						type="text"
						matInput
						formControlName="artist"
						placeholder="The Prodigy"
					/>
					@if (
						form.get("artist")?.hasError("required") &&
						form.get("artist")?.touched
					) {
						<mat-error
							>Artist is <strong>required</strong></mat-error
						>
					}
				</mat-form-field>

				<div class="flex flex-row items-center justify-between last">
					<mat-form-field
						subscriptSizing="dynamic"
						id="last"
						class="w-1/3"
						appearance="outline"
					>
						<mat-label>Difficulty</mat-label>
						<mat-select formControlName="difficulty">
							@for (
								difficulty of difficulties;
								track difficulty
							) {
								<mat-option [value]="difficulty.key">
									{{ difficulty.value }}
								</mat-option>
							}
						</mat-select>
					</mat-form-field>
					<mat-slide-toggle
						labelPosition="before"
						formControlName="isDeluxe"
					>
						Is deluxe?
					</mat-slide-toggle>
					<mat-slide-toggle
						labelPosition="before"
						formControlName="isExplicit"
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
		MatLabel,
		MatSelectModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSlideToggleModule,
		ReactiveFormsModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogSection2Component implements OnInit {
	form: FormGroup;
	difficulties = Object.values(Difficulty).map((difficulty) => ({
		key: difficulty,
		value: getDifficultyLabel(difficulty),
	}));

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<UploadDialogSection2Component>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadFormData,
	) {
		this.form = this.fb.group({
			track: [initialFormData.track, Validators.required],
			artist: [initialFormData.artist, Validators.required],
			difficulty: [initialFormData.difficulty],
			isDeluxe: [initialFormData.isDeluxe],
			isExplicit: [initialFormData.isExplicit],
		});
	}

	ngOnInit() {
		// Initialize form with existing data
		this.form.patchValue(this.formData);
	}

	onSubmit() {
		if (this.form.valid) {
			this.dialogRef.close(this.form.value);
		}
	}
}
