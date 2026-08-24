import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from "@angular/core";

// Material
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { ThemeAssetsBatchUploadComponent } from "@/components/theme-assets/batch-upload.component";
import {
	ThemeAssetFilesValue,
	ThemeAssetsFilesFormComponent,
} from "@/components/theme-assets/files-form.component";

// Services
import { ThemeService } from "@/services/api/theme.service";

// Models
import type { ThemeModel } from "@/models/theme.model";
import type { ThemeAssets } from "@/models/theme/beatstar-themes";
import { getBeatstarTheme } from "@/models/theme/theme-genres";

// Utils
import JSZip from "jszip";
import { getApiErrorMessage } from "@/models/api-error.model";
import { ErrorDialogComponent } from "@/components/dialogs/error.component";

export interface PublishVersionDialogData {
	themeId: string;
	theme?: ThemeModel;
}

type VersionFiles = Record<string, File>;

@Component({
	selector: "app-publish-theme-version-dialog",
	templateUrl: "./publish-version-dialog.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ThemeAssetsBatchUploadComponent,
		ThemeAssetsFilesFormComponent,
	],
})
export class PublishVersionDialogComponent {
	private themeService = inject(ThemeService);
	private _snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);

	readonly dialogRef = inject(MatDialogRef<PublishVersionDialogComponent>);
	readonly data = inject<PublishVersionDialogData>(MAT_DIALOG_DATA);

	readonly step = signal<"batch" | "files">("batch");
	readonly isLoading = signal(false);

	goToFilesStep(): void {
		this.step.set("files");
	}

	goToBatchStep(): void {
		this.step.set("batch");
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	async onBatchFilesSelected(files: VersionFiles): Promise<void> {
		await this.publish(files);
	}

	async onFilesSubmitted(value: ThemeAssetFilesValue): Promise<void> {
		const files: VersionFiles = {};
		for (const [key, file] of Object.entries(value)) {
			if (file instanceof File) {
				files[key] = file;
			}
		}

		await this.publish(files);
	}

	async publish(files: VersionFiles): Promise<void> {
		this.dialogRef.disableClose = true;
		this.isLoading.set(true);

		try {
			const bundleFile = await this.buildBundle(files);

			const version = await this.themeService.addThemeVersion(
				this.data.themeId,
				{ bundleFile },
			);

			this._snackBar.open(
				`Version v${version.versionCode} published with success!`,
				"Close",
				{ duration: 3000 },
			);

			this.dialogRef.close(version);
			window.location.reload();
		} catch (error: unknown) {
			console.error("Failed to publish new version:", error);

			const errorMessage = getApiErrorMessage(
				error,
				"An error occurred while publishing the new version.",
			);

			this.dialogRef.close();
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Failed to publish new version",
					message: errorMessage.message,
					error: errorMessage.error,
				},
			});
		} finally {
			this.isLoading.set(false);
			this.dialogRef.disableClose = false;
		}
	}

	/**
	 * Bundles the uploaded assets into a .zip, naming each entry with
	 * the UUID of the asset it replaces in the original Beatstar theme
	 * (same strategy as the theme publish flow).
	 */
	private async buildBundle(files: VersionFiles): Promise<File> {
		const replaces = this.data.theme?.replaces;
		const replacedTheme = replaces ? getBeatstarTheme(replaces) : undefined;

		function stripExtension(fileName: string): string {
			return fileName.replace(/\.[^.]+$/, "");
		}

		const zip = new JSZip();
		for (const [assetKey, file] of Object.entries(files)) {
			const assetType = assetKey.replace(/File$/, "") as keyof ThemeAssets;
			const uuid = replacedTheme?.assets[assetType] || null;
			zip.file(uuid ?? stripExtension(file.name), file);
		}

		const blob = await zip.generateAsync({ type: "blob" });
		return new File([blob], "theme.zip", { type: "application/zip" });
	}
}
