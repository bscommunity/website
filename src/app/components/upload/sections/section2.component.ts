import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";

import {
	FormControl,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";

import { UploadDialogSection1Component } from "./section1.component";
import { UploadFormData } from "../upload.component";
import { Difficulty } from "@/lib/data";

@Component({
	selector: "app-upload-dialog-section2",
	template: `
		<h2 mat-dialog-title>Chart details</h2>
		<mat-dialog-content class="mat-typography !flex flex-col gap-4">
			<p>
				Fill in the details for your chart submission. Make sure all the
				required fields are filled before proceeding
			</p>
			<mat-form-field>
				<mat-label>Title</mat-label>
				<input
					type="text"
					matInput
					[formControl]="formControls.title"
					[(ngModel)]="formData.title"
					placeholder="We Live Forever"
				/>
				@if (formControls.title.hasError("required")) {
					<mat-error>Title is <strong>required</strong></mat-error>
				}
				<mat-hint align="start">Testando</mat-hint>
			</mat-form-field>
			<mat-form-field>
				<mat-label>Artist</mat-label>
				<input
					type="text"
					matInput
					[formControl]="formControls.artist"
					[(ngModel)]="formData.artist"
					placeholder="The Prodigy"
				/>
				@if (formControls.artist.hasError("required")) {
					<mat-error>Artist is <strong>required</strong></mat-error>
				}
			</mat-form-field>
			<mat-form-field>
				<mat-label>Album</mat-label>
				<input
					type="text"
					matInput
					[formControl]="formControls.album"
					[(ngModel)]="formData.album"
					placeholder="No Tourists"
				/>
				@if (formControls.album.hasError("required")) {
					<mat-error>Album is <strong>required</strong></mat-error>
				}
			</mat-form-field>
			<div class="flex flex-row items-center justify-between">
				<mat-form-field>
					<mat-label>Difficulty</mat-label>
					<mat-select
						[(ngModel)]="formData.difficulty"
						name="difficulty"
					>
						@for (difficulty of difficulties; track difficulty) {
							<mat-option [value]="difficulty">
								{{ getDifficultyLabel(difficulty) }}
							</mat-option>
						}
					</mat-select>
				</mat-form-field>
			</div>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button (click)="dialogRef.close()">Cancel</button>
			<button
				mat-button
				[disabled]="!formData.title"
				(click)="dialogRef.close(formData)"
			>
				Continue
			</button>
		</mat-dialog-actions>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatLabel,
		MatSelectModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		ReactiveFormsModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialogSection2Component {
	formControls = {
		title: new FormControl("", [Validators.required]),
		artist: new FormControl("", [Validators.required]),
		album: new FormControl("", [Validators.required]),
	};
	difficulties = Object.values(Difficulty);

	constructor(
		public dialogRef: MatDialogRef<UploadDialogSection1Component>,
		@Inject(MAT_DIALOG_DATA) public formData: UploadFormData,
	) {}

	getDifficultyLabel(difficulty: Difficulty): string {
		return Difficulty[difficulty];
	}
}
