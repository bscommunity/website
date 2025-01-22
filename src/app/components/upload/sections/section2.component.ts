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

import { UploadFormData } from "../upload.component";

import { Difficulty } from "@/lib/data";

@Component({
	selector: "app-upload-dialog-section2",
	template: `
		<h2 mat-dialog-title>Chart details</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content
				class="mat-typography !flex flex-col gap-2 !pb-0"
			>
				<p class="mb-2">
					Fill in the details for your chart submission. Make sure all
					the required fields are filled before proceeding
				</p>
				<mat-form-field appearance="outline">
					<mat-label>Title</mat-label>
					<input
						type="text"
						matInput
						formControlName="title"
						placeholder="We Live Forever"
					/>
					@if (
						form.get("title")?.hasError("required") &&
						form.get("title")?.touched
					) {
						<mat-error
							>Title is <strong>required</strong></mat-error
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
				<mat-form-field appearance="outline">
					<mat-label>Album</mat-label>
					<input
						matInput
						type="text"
						formControlName="album"
						placeholder="No Tourists"
					/>
					@if (
						form.get("album")?.hasError("required") &&
						form.get("album")?.touched
					) {
						<mat-error
							>Album is <strong>required</strong></mat-error
						>
					}
				</mat-form-field>
				<div class="flex flex-row items-center justify-between last">
					<mat-form-field
						subscriptSizing="dynamic"
						id="last"
						appearance="outline"
					>
						<mat-label>Difficulty</mat-label>
						<mat-select formControlName="difficulty">
							@for (
								difficulty of difficulties;
								track difficulty
							) {
								<mat-option [value]="difficulty">
									{{ getDifficultyLabel(difficulty) }}
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
	difficulties = Object.values(Difficulty);

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<UploadDialogSection2Component>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadFormData,
	) {
		this.form = this.fb.group({
			title: ["", Validators.required],
			artist: ["", Validators.required],
			album: ["", Validators.required],
			difficulty: [Difficulty.Normal],
			isDeluxe: [false],
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

	getDifficultyLabel(difficulty: Difficulty): string {
		return Difficulty[difficulty];
	}
}
