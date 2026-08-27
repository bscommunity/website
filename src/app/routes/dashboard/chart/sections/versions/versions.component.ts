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
// Material
import { MatDialog } from "@angular/material/dialog";
import { NgGlyph } from "@ng-icons/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationDialogComponent } from "@/components/dialogs/confirmation/confirmation-dialog.component";
// Components
import { ErrorDialogComponent } from "@/components/dialogs/error.component";
import { PublishDialogLoadingComponent } from "@/components/dialogs/loading.component";
import { PublishVersionChangelogComponent } from "@/components/publish/version/changelog.component";
// Utils
import { getApiErrorMessage } from "@/models/api-error.model";
// Model
import { type VersionModel, Version } from "@/models/version.model";
import { ChartService } from "@/services/api/chart.service";
import { CacheService } from "@/services/cache.service";
import { type ChartModel } from "@/models/chart.model";

// Service
import { initialChartFormData, ChartPublishHandler } from "@/services/publish/handlers/chart-publish.handler";
import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";
import {
	type Action,
	type TableColumn,
	TableComponent,
} from "../../subcomponents/table/table.component";

@Component({
	selector: "app-chart-versions-section",
	imports: [
		// Modules
		NgGlyph,
		MatButtonModule,
		// Components
		ChartSectionComponent,
		TableComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./versions.component.html",
})
export class VersionsComponent {
	readonly chartId = input.required<string>();
	readonly chart = input<any>(undefined);
	readonly versions = input<VersionModel[]>([]);

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	readonly chartService = inject(ChartService);
	private cacheService = inject(CacheService);
	readonly chartPublishHandler = inject(ChartPublishHandler);

	readonly versionTable =
		viewChild.required<TableComponent<VersionModel>>("versionTable");

	isFetchingBundle = signal(false);
	saving = signal(false);

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
		{
			description: "Switch version",
			icon: "swap_horiz",
			callback: () => {
				this.openSnackBar("Not implemented yet.", "Close");
			},
			disabled: (index, item) => {
				// Check if this is the latest version by comparing with the versions signal
				const versions = this.versions();
				return (
					versions.length === 0 ||
					item.id === versions[versions.length - 1].id
				);
			},
		},
		{
			description: "Delete version",
			icon: "delete_forever",
			callback: this.openRemoveVersionDialog.bind(this),
			// We only allow deleting the latest version (except for the first version)
			disabled: (_, item) => {
				const versions = this.versions();
				return (
					versions.length === 0 ||
					item.id !== versions[versions.length - 1].id ||
					item.versionCode <= 1
				);
			},
		},
	]);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	async downloadBundle() {
		if (this.isFetchingBundle()) return;

		try {
			this.isFetchingBundle.set(true);
			const url = await this.chartService.getBundleUrl(this.chartId());
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
		const sourceDialog = this.dialog.open(
			this.chartPublishHandler.getStepComponents()[2],
			{
				data: {
					title: "Upload Chart",
					description:
						"Upload a new version of your chart. Ensure your file meets the submission guidelines.",
					formData: { ...initialChartFormData },
					inactive: [],
					mode: "uploading",
				},
			},
		);

		sourceDialog.afterClosed().subscribe((sourceResult) => {
			if (!sourceResult || sourceResult === "back") return;

			const changelogDialog = this.dialog.open(
				PublishVersionChangelogComponent,
				{
					width: "500px",
					disableClose: true,
					data: { formData: {} },
				},
			);

			changelogDialog.afterClosed().subscribe((changelogResult) => {
				if (!changelogResult || changelogResult === "back") return;

				this.dialog.open(PublishDialogLoadingComponent);

				const chartBundle = sourceResult.chartBundle;
				if (!chartBundle) return;

				this.addVersion(changelogResult.changelog ?? "", chartBundle);
			});
		});
	}

	async addVersion(changelog: string, chartBundle: File) {
		if (this.saving()) return;
		this.saving.set(true);

		try {
			const response = await this.chartService.addVersion(
				this.chartId(),
				changelog,
				chartBundle,
			);

			if (!response) {
				this.saving.set(false);
				this.dialog.closeAll();
				this.dialog.open(ErrorDialogComponent, {
					data: {
						message: "Failed to submit chart.",
						error: "No response from server.",
					},
				});
				return;
			}

			// Cache is updated by chartService.addVersion; sync the table from cache
			const updated = this.cacheService.getEntity<ChartModel>("chart", this.chartId());
			if (updated) {
				const table = this.versionTable();
				table.updateTableData(() => updated.versions.map((v) => Version.parse(v)));
			}
			this._snackBar.open("Version added with success!", "Close");
			this.dialog.closeAll();
		} catch (error: unknown) {
			console.error("Failed to add new version:", error);

			const errorMessage = getApiErrorMessage(
				error,
				"An error occurred while adding the new version.",
			);

			this.dialog.closeAll();
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Failed to add new version",
					message: errorMessage.message,
					error: errorMessage.error,
				},
			});
			this.saving.set(false);
		}
	}

	openRemoveVersionDialog(_: number, version: VersionModel): void {
		console.log("Removing version", version);

		const operation = async () => {
			const result = await this.chartService.deleteVersion(
				this.chartId(),
				version.id,
			);

			if (!result) {
				throw new Error("An error occurred");
			}

			// Cache is updated by chartService.deleteVersion; sync the table from cache
			const updated = this.cacheService.getEntity<ChartModel>("chart", this.chartId());
			if (updated) {
				const table = this.versionTable();
				table.updateTableData(() => updated.versions.map((v) => Version.parse(v)));
			}
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Version",
				description:
					"Are you sure you want to remove this version? It will not be available for download or rollback anymore.",
				success: "Version removed with success!",
				operation,
			},
		});
	}
}
