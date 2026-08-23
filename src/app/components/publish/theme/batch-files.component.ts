import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	ViewChild,
	inject,
} from "@angular/core";

import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgGlyph } from "@ng-icons/core";
import JSZip from "jszip";

import { type DialogData } from "@/services/publish/publish.service";
import type { ThemeFormData } from "@/services/publish/handlers/theme-publish.handler";
import {
	rock,
	pop,
	alternative,
	hipHop,
	universal,
	rnb,
	dance,
	country,
} from "@/models/theme/beatstar-themes-data";

interface IdentifiedFile {
	file: File;
	assetType: string;
	dimensions: string;
}

interface AssetTypeInfo {
	key: string;
	label: string;
	expectedWidth: number;
	expectedHeight: number | null;
}

const ASSET_TYPES: AssetTypeInfo[] = [
	{ key: "icon", label: "Icon", expectedWidth: 256, expectedHeight: 256 },
	{ key: "track", label: "Track", expectedWidth: 512, expectedHeight: null },
	{ key: "top", label: "Top", expectedWidth: 512, expectedHeight: 256 },
	{
		key: "perfectBar",
		label: "Perfect Bar",
		expectedWidth: 64,
		expectedHeight: 256,
	},
	{
		key: "perfectLine",
		label: "Perfect Line",
		expectedWidth: 512,
		expectedHeight: 32,
	},
	{ key: "circle", label: "Circle", expectedWidth: 256, expectedHeight: 256 },
	{ key: "bottom", label: "Bottom", expectedWidth: 512, expectedHeight: 256 },
];

const OBLIGATORY_TYPES = ["icon", "top", "perfectBar"];

function buildUuidLookup(): Map<string, AssetTypeInfo[]> {
	const lookup = new Map<string, AssetTypeInfo[]>();
	const allThemes = [
		...rock,
		...pop,
		...alternative,
		...hipHop,
		...universal,
		...rnb,
		...dance,
		...country,
	];

	for (const theme of allThemes) {
		for (const [type, uuid] of Object.entries(theme.assets)) {
			if (!uuid) continue;
			const assetInfo = ASSET_TYPES.find((a) => a.key === type);
			if (!assetInfo) continue;

			const existing = lookup.get(uuid);
			if (existing) {
				existing.push(assetInfo);
			} else {
				lookup.set(uuid, [assetInfo]);
			}
		}
	}

	return lookup;
}

function loadImageDimensions(
	file: File,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({ width: img.naturalWidth, height: img.naturalHeight });
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error(`Could not load image: ${file.name}`));
		};
		img.src = url;
	});
}

@Component({
	selector: "app-publish-theme-batch-files",
	template: `
		<h2 mat-dialog-title>Batch upload</h2>
		<mat-dialog-content class="mat-typography">
			<p class="mb-4">
				If you already have the files from a previous theme, batch
				select them or import from a .zip bundle
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
				(click)="dialogRef.close('back')"
			>
				Back
			</button>
			@if (hasInsertedFiles) {
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-flat-button
					type="button"
					[disabled]="!canContinue()"
					(click)="onSubmit()"
				>
					Continue
				</button>
			} @else {
				<button
					class="w-full md:w-[49%]! mx-0!"
					mat-flat-button
					type="button"
					(click)="onSkip()"
				>
					Skip
				</button>
			}
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule, NgGlyph],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeBatchFilesComponent {
	@ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

	isDraggingOver = false;
	identifiedFiles: IdentifiedFile[] = [];

	dialogRef = inject<
		MatDialogRef<PublishThemeBatchFilesComponent>
	>(MatDialogRef);
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

	getAssetLabel(key: string): string {
		return ASSET_TYPES.find((a) => a.key === key)?.label ?? key;
	}

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

	onSkip(): void {
		this.dialogRef.close("next");
	}

	onSubmit(): void {
		const result: Record<string, File | null> = {};

		for (const item of this.identifiedFiles) {
			if (item.assetType === "unknown") continue;
			const assetKey = `${item.assetType}File`;
			if (!result[assetKey]) {
				result[assetKey] = item.file;
			}
		}

		this.dialogRef.close(result);
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

		if (!uuidCandidates) {
			return {
				file,
				assetType: "unknown",
				dimensions: "",
			};
		}

		try {
			const { width, height } = await loadImageDimensions(file);
			const dimensions = `${width}x${height}`;

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

			return { file, assetType: "unknown", dimensions };
		} catch {
			return { file, assetType: "unknown", dimensions: "" };
		}
	}
}
