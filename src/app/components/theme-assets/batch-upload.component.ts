import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	ViewChild,
	inject,
	input,
	output,
} from "@angular/core";

import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgGlyph } from "@ng-icons/core";
import JSZip from "jszip";

import {
	buildUuidLookup,
	detect256x256ImageType,
	getAssetLabel,
	loadImageDimensions,
	OBLIGATORY_TYPES,
	type IdentifiedFile,
} from "@/models/theme/theme-asset-upload";

/**
 * Shared batch upload step used by both the theme publish wizard and
 * the publish new version flow. Users drop images or a .zip bundle
 * which get identified by their Beatstar UUID filename. Optional -
 * emits `skipped` when the user proceeds without files.
 */
@Component({
	selector: "app-theme-assets-batch-upload",
	template: `
		<h2 mat-dialog-title>Batch upload</h2>
		<mat-dialog-content class="mat-typography">
			<p class="mb-4">{{ description() }}</p>

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
					<span class="font-medium">Release to add files</span>
				} @else {
					<span>
						Drag and drop images or a .zip bundle here or
						<button
							class="underline text-primary"
							type="button"
							(click)="selectFiles()"
						>
							select files
						</button>
					</span>
				}
			</div>

			<input
				#fileInput
				type="file"
				accept=".png,.jpg,.jpeg,.webp,.zip"
				multiple
				class="hidden"
				(change)="onFileSelected($event)"
			/>

			@if (identifiedFiles.length > 0) {
				<ul
					class="mt-4 border border-surface-variant rounded-lg overflow-hidden"
				>
					@for (item of identifiedFiles; track $index) {
						<li
							class="flex items-center justify-between gap-6 px-4 py-3 border-surface-variant"
							[class.border-b]="!$last"
						>
							<div
								class="flex items-center justify-start gap-4 flex-1 min-w-0"
							>
								<ng-glyph
									name="image"
									size="24"
									[class.text-primary]="
										item.assetType !== 'unknown'
									"
									[class.text-error]="
										item.assetType === 'unknown'
									"
									class="shrink-0"
								></ng-glyph>

								<div class="flex flex-col min-w-0">
									<span
										class="font-medium overflow-hidden whitespace-nowrap text-ellipsis"
										>{{ item.file.name }}</span
									>
									@if (item.assetType === "unknown") {
										<span class="text-sm text-error">
											Unknown UUID name
										</span>
									} @else {
										<span class="text-sm text-outline">
											{{ getAssetLabel(item.assetType) }}
											({{ item.dimensions }})
											@if (item.heuristicMatch) {
												<span class="text-xs italic">
													auto-detected
												</span>
											}
										</span>
									}
								</div>
							</div>
							<button
								mat-icon-button
								type="button"
								aria-label="Remove file"
								(click)="removeFile($index)"
							>
								<ng-glyph
									name="close"
									size="20"
									class="text-on-surface-variant"
								></ng-glyph>
							</button>
						</li>
					}
				</ul>
			}
		</mat-dialog-content>
		<mat-dialog-actions align="end" class="gap-2">
			<button
				class="w-full md:w-[49%]! mx-0!"
				mat-button
				type="button"
				[disabled]="disabled()"
				(click)="canceled.emit()"
			>
				{{ cancelLabel() }}
			</button>
			@if (hasInsertedFiles) {
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-flat-button
					type="button"
					[disabled]="!canContinue() || disabled()"
					(click)="submit()"
				>
					{{ confirmLabel() }}
				</button>
			} @else {
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-flat-button
					type="button"
					[disabled]="disabled()"
					(click)="skipped.emit()"
				>
					Skip
				</button>
			}
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule, NgGlyph],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeAssetsBatchUploadComponent {
	@ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

	readonly disabled = input(false);
	readonly description = input(
		"If you already have the files from a previous theme, batch select them or import from a .zip bundle",
	);
	readonly cancelLabel = input("Back");
	readonly confirmLabel = input("Continue");

	readonly canceled = output<void>();
	readonly skipped = output<void>();
	readonly filesSelected = output<Record<string, File>>();

	isDraggingOver = false;
	identifiedFiles: IdentifiedFile[] = [];

	private cdr = inject(ChangeDetectorRef);
	private snackBar = inject(MatSnackBar);
	private uuidLookup = buildUuidLookup();

	get hasInsertedFiles(): boolean {
		return this.identifiedFiles.length > 0;
	}

	get hasValidFiles(): boolean {
		return this.identifiedFiles.some((f) => f.assetType !== "unknown");
	}

	get hasAllObligatoryFiles(): boolean {
		const identifiedTypes = new Set(
			this.identifiedFiles
				.filter((f) => f.assetType !== "unknown")
				.map((f) => f.assetType),
		);
		return OBLIGATORY_TYPES.every((t) => identifiedTypes.has(t));
	}

	canContinue(): boolean {
		return this.hasValidFiles && this.hasAllObligatoryFiles;
	}

	getAssetLabel = getAssetLabel;

	selectFiles(): void {
		this.fileInput.nativeElement.click();
	}

	async onFileSelected(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			await this.processFiles(Array.from(input.files));
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

	async onDrop(event: Event): Promise<void> {
		event.preventDefault();
		this.isDraggingOver = false;

		const dragEvent = event as DragEvent;
		const files = dragEvent.dataTransfer?.files;
		if (files) {
			await this.processFiles(Array.from(files));
		}
	}

	removeFile(index: number): void {
		this.identifiedFiles.splice(index, 1);
		this.cdr.markForCheck();
	}

	submit(): void {
		const result: Record<string, File> = {};

		for (const item of this.identifiedFiles) {
			if (item.assetType === "unknown") continue;
			const assetKey = `${item.assetType}File`;
			if (!result[assetKey]) {
				result[assetKey] = item.file;
			}
		}

		this.filesSelected.emit(result);
	}

	private async processFiles(files: File[]): Promise<void> {
		const newFiles: IdentifiedFile[] = [];

		for (const file of files) {
			if (file.name.endsWith(".zip")) {
				const extracted = await this.extractZip(file);
				newFiles.push(...extracted);
			} else if (file.type.startsWith("image/")) {
				const identified = await this.identifyImageFile(file);
				newFiles.push(identified);
			} else {
				this.snackBar.open(
					`Skipped unsupported file: ${file.name}`,
					"Close",
					{ duration: 3000 },
				);
			}
		}

		this.identifiedFiles.push(...newFiles);
		this.cdr.markForCheck();
	}

	private async extractZip(file: File): Promise<IdentifiedFile[]> {
		try {
			const zip = await JSZip.loadAsync(file);
			const results: IdentifiedFile[] = [];

			for (const [, zipEntry] of Object.entries(zip.files)) {
				if (zipEntry.dir) continue;

				const name = zipEntry.name.split("/").pop() ?? zipEntry.name;
				const lowerName = name.toLowerCase();
				if (
					!lowerName.endsWith(".png") &&
					!lowerName.endsWith(".jpg") &&
					!lowerName.endsWith(".jpeg") &&
					!lowerName.endsWith(".webp")
				) {
					continue;
				}

				const blob = await zipEntry.async("blob");
				const imageFile = new File([blob], name, {
					type: blob.type,
				});
				const identified = await this.identifyImageFile(imageFile);
				results.push(identified);
			}

			return results;
		} catch {
			this.snackBar.open(
				`Could not read zip file: ${file.name}`,
				"Close",
				{ duration: 3000 },
			);
			return [];
		}
	}

	private async identifyImageFile(file: File): Promise<IdentifiedFile> {
		const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
		const uuidCandidates = this.uuidLookup.get(nameWithoutExt);

		try {
			const { width, height } = await loadImageDimensions(file);
			const dimensions = `${width}x${height}`;

			if (uuidCandidates) {
				for (const candidate of uuidCandidates) {
					if (candidate.expectedHeight === null) {
						if (
							width === candidate.expectedWidth &&
							height >= 512 &&
							height <= 2048
						) {
							return { file, assetType: candidate.key, dimensions };
						}
					} else {
						if (
							width === candidate.expectedWidth &&
							height === candidate.expectedHeight
						) {
							return { file, assetType: candidate.key, dimensions };
						}
					}
				}
			}

			if (width === 256 && height === 256) {
				const heuristic = await detect256x256ImageType(file);
				if (heuristic) {
					return {
						file,
						assetType: heuristic,
						dimensions,
						heuristicMatch: true,
					};
				}
			}

			return { file, assetType: "unknown", dimensions };
		} catch {
			return { file, assetType: "unknown", dimensions: "" };
		}
	}
}
