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

// Types
import { type DialogData } from "@/services/publish/publish.service";

interface Bundle {
	name: string;
	duration: string;
	notes: string;
	status: "ready" | "parsing" | "uploading" | "success" | "error";
	errorMessage?: string;
	files: File;
}

@Component({
	selector: "app-publish-chart-batch",
	template: `
		<h2 mat-dialog-title>Batch upload</h2>
		<form [formGroup]="form" (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography">
				<p class="mb-4">Drop multiple chart bundles at once</p>
				<div
					class="flex flex-col items-center justify-center gap-2 p-4 border border-dashed border-surface-variant rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
				>
					<ng-glyph
						name="file_upload"
						size="32"
						class="text-primary mb-2"
					></ng-glyph>
					<span>
						Drag and drop .zip bundles here or
						<button
							class="underline text-primary"
							(click)="selectFiles()"
						>
							select files
						</button>
					</span>
				</div>

				<ul
					class="mt-4 border border-surface-variant rounded-lg overflow-hidden"
				>
					@for (bundle of bundles; track $index) {
						<li
							class="flex items-center justify-between gap-6 px-4 py-3 border-surface-variant"
							[class.border-b]="!$last"
						>
							<div
								class="flex items-center justify-start gap-4 flex-1 min-w-0"
							>
								<ng-glyph
									name="folder_zip"
									size="24"
									class="text-primary shrink-0"
								></ng-glyph>

								<div class="flex flex-col min-w-0">
									<span
										class="font-medium overflow-hidden whitespace-nowrap text-ellipsis"
										>{{ bundle.name }}</span
									>
									@if (bundle.status === "error") {
										<span class="text-sm text-error">{{
											bundle.errorMessage
										}}</span>
									} @else {
										<span class="text-sm text-outline">
											{{ bundle.duration }} •
											{{ bundle.notes }}
										</span>
									}
								</div>
							</div>
							<div class="flex items-center justify-center gap-2">
								<div
									class="bg-secondary-container rounded-full px-2.5 py-0.5 text-xs text-on-secondary-container"
									[class.animate-pulse]="
										bundle.status === 'parsing' ||
										bundle.status === 'uploading'
									"
								>
									{{ bundle.status }}
								</div>
								<button
									mat-icon-button
									type="button"
									aria-label="Edit file"
								>
									<ng-glyph
										name="edit"
										size="20"
										class="text-on-surface-variant"
									></ng-glyph>
								</button>
								<button
									mat-icon-button
									type="button"
									aria-label="Remove file"
								>
									<ng-glyph
										name="close"
										size="20"
										class="text-on-surface-variant"
									></ng-glyph>
								</button>
							</div>
						</li>
					}
				</ul>
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button
					type="button"
					mat-button
					(click)="dialogRef.close('back')"
				>
					Cancel
				</button>
				<button
					type="submit"
					mat-flat-button
					[disabled]="
						!form.get('chartFlow')?.value ||
						form.get('chartFlow')?.value === 'new'
					"
				>
					Upload all (3)
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
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishChartBatchComponent {
	private fb = inject(FormBuilder);
	dialogRef = inject<MatDialogRef<PublishChartBatchComponent>>(MatDialogRef);
	data = inject<DialogData>(MAT_DIALOG_DATA);

	form: FormGroup = this.fb.group({
		chartFlow: "existing",
	});

	bundles: Bundle[] = [
		{
			name: "we_live_forever.zip",
			duration: "5m30s",
			notes: "325 notes",
			status: "ready",
			files: new File([], "we_live_forever.zip"),
		},
		{
			name: "the_unfathomable_enormous_puzzle.zip",
			duration: "4m10s",
			notes: "510 notes",
			status: "parsing",
			files: new File([], "the_unfathomable_enormous_puzzle.zip"),
		},
		{
			name: "echoes_of_time.zip",
			duration: "1m10s",
			notes: "583 notes",
			status: "error",
			errorMessage: "missing cover art",
			files: new File([], "echoes_of_time.zip.zip"),
		},
	];

	selectFiles() {
		// Logic to open file selector and handle file selection
	}

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
