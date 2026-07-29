import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	ViewChild,
	inject,
	type OnDestroy,
} from "@angular/core";

import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgGlyph } from "@ng-icons/core";
import { Subject, takeUntil } from "rxjs";

import {
	BatchUploadQueueService,
	type Bundle,
} from "@/services/publish/batch-upload-queue.service";

@Component({
	selector: "app-publish-chart-batch",
	template: `
		<h2 mat-dialog-title>Batch upload</h2>
		<mat-dialog-content class="mat-typography">
			<p class="mb-4">
				Drop multiple chart bundles at once
				<span class="text-outline">
					({{ queue.bundlesCount }}/{{ queue.maxBundles }})
				</span>
			</p>

			<div
				class="flex flex-col items-center justify-center gap-2 p-4 border border-dashed rounded-lg transition-colors duration-150"
				[class.border-surface-variant]="!isDraggingOver"
				[class.border-primary]="isDraggingOver"
				[class.bg-primary/10]="isDraggingOver"
				[class.scale-[1.01]]="isDraggingOver"
				(dragover)="onDragOver($event)"
				(dragleave)="onDragLeave($event)"
				(drop)="onDrop($event)"
			>
				<ng-glyph
					[name]="isDraggingOver ? 'add_circle' : 'file_upload'"
					size="32"
					class="mb-2 transition-all"
					[class.text-primary]="true"
				></ng-glyph>
				@if (isDraggingOver) {
					<span class="font-medium">Release to add bundles</span>
				} @else {
					<span>
						Drag and drop .zip bundles here or
						<button
							class="underline text-primary"
							type="button"
							(click)="selectFiles()"
						>
							select files
						</button>
					</span>
				}
				@if (queue.bundlesCount >= queue.maxBundles) {
					<span class="text-sm text-outline mt-1">
						Maximum of {{ queue.maxBundles }} bundles reached
					</span>
				}
			</div>

			<input
				#fileInput
				type="file"
				accept=".zip"
				multiple
				class="hidden"
				(change)="onFileSelected($event)"
			/>

			@if (bundles.length > 0) {
				<ul
					class="mt-4 border border-surface-variant rounded-lg overflow-hidden"
				>
					@for (bundle of bundles; track bundle.id) {
						<li
							class="flex items-center justify-between gap-6 px-4 py-3 border-surface-variant"
							[class.border-b]="!$last"
							[class.py-5]="bundle.status === 'uploading'"
						>
							<div
								class="flex items-center justify-start gap-4 flex-1 min-w-0"
							>
								<ng-glyph
									name="folder_zip"
									size="24"
									[class.text-primary]="
										bundle.status === 'ready'
									"
									[class.text-on-secondary-container]="
										bundle.status === 'uploading'
									"
									[class.text-success]="
										bundle.status === 'success'
									"
									[class.text-error]="
										bundle.status === 'error'
									"
									class="shrink-0"
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
									} @else if (bundle.status === "success") {
										<span class="text-sm text-success">
											Uploaded successfully
										</span>
									}
								</div>
							</div>
							<div class="flex items-center justify-center gap-2">
								<div
									class="bg-secondary-container rounded-full px-2.5 py-0.5 text-xs text-on-secondary-container"
									[class.animate-pulse]="
										bundle.status === 'uploading'
									"
									[class.bg-success-container]="
										bundle.status === 'success'
									"
									[class.bg-error-container]="
										bundle.status === 'error'
									"
								>
									{{ bundle.status }}
								</div>
								@if (bundle.status === "ready") {
									<button
										mat-icon-button
										type="button"
										aria-label="Remove file"
										(click)="removeBundle(bundle.id)"
									>
										<ng-glyph
											name="close"
											size="20"
											class="text-on-surface-variant"
										></ng-glyph>
									</button>
								}
							</div>
						</li>
					}
				</ul>
			}

			@if (completedCount > 0 && !isUploading) {
				<div class="mt-4 text-sm text-outline text-center">
					{{ successCount }} uploaded
					@if (errorCount > 0) {
						, {{ errorCount }} failed
					}
				</div>
			}
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button type="button" mat-button (click)="onCancel()">
				@if (isUploading) {
					Cancel uploads
				} @else {
					Close
				}
			</button>
			@if (!isUploading && !isCompleted) {
				<button
					type="button"
					mat-flat-button
					[disabled]="readyCount === 0"
					(click)="onSubmit()"
				>
					Upload all ({{ readyCount }})
				</button>
			}
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule, NgGlyph],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishChartBatchComponent implements OnDestroy {
	@ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

	isDraggingOver = false;

	queue = inject(BatchUploadQueueService);
	dialogRef = inject<MatDialogRef<PublishChartBatchComponent>>(MatDialogRef);
	private cdr = inject(ChangeDetectorRef);
	private snackBar = inject(MatSnackBar);
	private destroy$ = new Subject<void>();

	bundles: Bundle[] = [];

	get readyCount(): number {
		return this.bundles.filter((b) => b.status === "ready").length;
	}

	get isUploading(): boolean {
		return this.bundles.some((b) => b.status === "uploading");
	}

	get isCompleted(): boolean {
		return (
			this.bundles.length > 0 &&
			this.bundles.every(
				(b) => b.status === "success" || b.status === "error",
			)
		);
	}

	get completedCount(): number {
		return this.bundles.filter(
			(b) => b.status === "success" || b.status === "error",
		).length;
	}

	get successCount(): number {
		return this.bundles.filter((b) => b.status === "success").length;
	}

	get errorCount(): number {
		return this.bundles.filter((b) => b.status === "error").length;
	}

	constructor() {
		this.queue.bundles$
			.pipe(takeUntil(this.destroy$))
			.subscribe((bundles) => {
				this.bundles = bundles;
				this.cdr.detectChanges();
			});
	}

	ngOnDestroy(): void {
		this.queue.cancelAll();
		this.destroy$.next();
		this.destroy$.complete();
	}

	selectFiles(): void {
		this.fileInput.nativeElement.click();
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const { skipped } = this.queue.addFiles(Array.from(input.files));
			if (skipped.length > 0) {
				this.showDuplicateWarning(skipped);
			}
			input.value = "";
		}
	}

	onDragOver(event: Event): void {
		event.preventDefault();
		this.isDraggingOver = true;
	}

	onDragLeave(event: Event): void {
		event.preventDefault();
		this.isDraggingOver = false;
	}

	onDrop(event: Event): void {
		event.preventDefault();
		this.isDraggingOver = false;

		const dragEvent = event as DragEvent;
		const files = dragEvent.dataTransfer?.files;
		if (files) {
			const { skipped } = this.queue.addFiles(Array.from(files));
			if (skipped.length > 0) {
				this.showDuplicateWarning(skipped);
			}
		}
	}

	private showDuplicateWarning(skipped: string[]): void {
		const count = skipped.length;
		const suffix = count === 1 ? "file was" : "files were";
		this.snackBar.open(
			`${count} ${suffix} already added and was skipped`,
			"Close",
			{ duration: 4000 },
		);
	}

	removeBundle(id: string): void {
		this.queue.removeBundle(id);
	}

	onSubmit(): void {
		this.queue.enqueue();
	}

	onCancel(): void {
		this.queue.cancelAll();
		this.dialogRef.close();
	}
}
