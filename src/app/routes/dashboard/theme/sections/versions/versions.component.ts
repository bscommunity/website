import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	signal,
	viewChild,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { NgGlyph } from "@ng-icons/core";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";
import {
	type Action,
	type TableColumn,
	TableComponent,
} from "../../../chart/subcomponents/table/table.component";

// Dialogs
import { PublishThemeBatchFilesComponent } from "@/components/publish/theme/batch-files.component";
import { PublishThemeFilesComponent } from "@/components/publish/theme/files.component";
import { PublishVersionChangelogComponent } from "@/components/publish/version/changelog.component";
import { ErrorDialogComponent } from "@/components/dialogs/error.component";
import { PublishDialogLoadingComponent } from "@/components/dialogs/loading.component";

// Models
import { type VersionModel } from "@/models/version.model";
import type { ThemeModel } from "@/models/theme.model";
import type { ThemeAssets } from "@/models/theme/beatstar-themes";
import { getBeatstarTheme } from "@/models/theme/theme-genres";

// Services
import { ThemeService } from "@/services/api/theme.service";
import { CacheService } from "@/services/cache.service";

// Utils
import { getApiErrorMessage } from "@/models/api-error.model";
import JSZip from "jszip";

type VersionFiles = Record<string, File>;

@Component({
	selector: "app-theme-versions-section",
	imports: [NgGlyph, MatButtonModule, ChartSectionComponent, TableComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./versions.component.html",
})
export class VersionsSectionComponent {
	readonly themeId = input.required<string>();
	readonly theme = input<ThemeModel | undefined>(undefined);
	readonly versions = input<VersionModel[]>([]);

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);
	private themeService = inject(ThemeService);
	private cacheService = inject(CacheService);

	readonly versionTable =
		viewChild.required<TableComponent<VersionModel>>("versionTable");

	isFetchingBundle = signal(false);
	saving = signal(false);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	versionsColumns: TableColumn<VersionModel>[] = [
		{
			columnDef: "versionCode",
			header: "Version",
			cell: (item: VersionModel) => `${item.versionCode}`,
		},
		{
			columnDef: "publishedAt",
			header: "Published At",
			cell: (item: VersionModel) => `${item.createdAt.toDateString()}`,
		},
		{
			columnDef: "downloads",
			header: "Downloads",
			cell: (item: VersionModel) => `${item.downloadsAmount ?? 0}`,
		},
	];

	versionsActions = computed<Action<VersionModel>[]>(() => [
		{
			description: "Download",
			icon: "download",
			callback: () => {
				this.downloadBundle();
			},
			disabled: () => this.isFetchingBundle(),
			loading: () => this.isFetchingBundle(),
		},
	]);

	async downloadBundle() {
		if (this.isFetchingBundle()) return;

		try {
			this.isFetchingBundle.set(true);
			const url = await this.themeService.getBundleUrl(this.themeId());
			window.open(url, "_blank");
		} catch {
			this._snackBar.open("Failed to get download link", "Close", {
				duration: 2500,
			});
		} finally {
			this.isFetchingBundle.set(false);
		}
	}

	openAddVersionDialog(): void {
		this.openBatchStep();
	}

	private openBatchStep(): void {
		const batchDialog = this.dialog.open(PublishThemeBatchFilesComponent, {
			width: "600px",
			disableClose: true,
		});

		batchDialog.afterClosed().subscribe((result) => {
			if (result === "back" || result == undefined) return;

			if (result === "next") {
				this.openFilesStep();
				return;
			}

			// Batch uploaded files — skip files step
			this.openChangelogStep(this.collectFiles(result));
		});
	}

	private openFilesStep(): void {
		const filesDialog = this.dialog.open(PublishThemeFilesComponent, {
			width: "600px",
			disableClose: true,
			data: { formData: {} },
		});

		filesDialog.afterClosed().subscribe((result) => {
			if (!result || result === "back") {
				this.openBatchStep();
				return;
			}

			this.openChangelogStep(this.collectFiles(result));
		});
	}

	private openChangelogStep(files: VersionFiles): void {
		const changelogDialog = this.dialog.open(
			PublishVersionChangelogComponent,
			{
				width: "500px",
				disableClose: true,
				data: { formData: {} },
			},
		);

		changelogDialog.afterClosed().subscribe((result) => {
			if (!result || result === "back") {
				this.openBatchStep();
				return;
			}

			this.publishVersion(files, result.changelog ?? "");
		});
	}

	private collectFiles(data: Record<string, unknown>): VersionFiles {
		const files: VersionFiles = {};
		for (const [key, value] of Object.entries(data)) {
			if (value instanceof File) {
				files[key] = value;
			}
		}
		return files;
	}

	async publishVersion(
		files: VersionFiles,
		changelog: string,
	): Promise<void> {
		if (this.saving()) return;
		this.saving.set(true);

		this.dialog.open(PublishDialogLoadingComponent);

		try {
			const bundleFile = await this.buildBundle(files);

			const version = await this.themeService.addVersion(
				this.themeId(),
				changelog,
				bundleFile,
			);

			// Cache is updated by themeService.addVersion; sync the table from cache
			const updated = this.cacheService.getEntity<ThemeModel>("theme", this.themeId());
			if (updated) {
				const table = this.versionTable();
				table.updateTableData(() => [...updated.versions]);
			}
			this._snackBar.open(
				`Version v${version.versionCode} published with success!`,
				"Close",
				{ duration: 3000 },
			);

			this.dialog.closeAll();
		} catch (error: unknown) {
			console.error("Failed to publish new version:", error);

			const errorMessage = getApiErrorMessage(
				error,
				"An error occurred while publishing the new version.",
			);

			this.dialog.closeAll();
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Failed to publish new version",
					message: errorMessage.message,
					error: errorMessage.error,
				},
			});
			this.saving.set(false);
		}
	}

	private async buildBundle(files: VersionFiles): Promise<File> {
		const replaces = this.theme()?.replaces;
		const replacedTheme = replaces ? getBeatstarTheme(replaces) : undefined;

		function stripExtension(fileName: string): string {
			return fileName.replace(/\.[^.]+$/, "");
		}

		const zip = new JSZip();
		for (const [assetKey, file] of Object.entries(files)) {
			const assetType = assetKey.replace(
				/File$/,
				"",
			) as keyof ThemeAssets;
			const uuid = replacedTheme?.assets[assetType] || null;
			zip.file(uuid ?? stripExtension(file.name), file);
		}

		const blob = await zip.generateAsync({ type: "blob" });
		return new File([blob], "theme.zip", { type: "application/zip" });
	}
}
