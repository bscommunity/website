import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	input,
	viewChild,
} from "@angular/core";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

// Components
import { ErrorDialogComponent } from "@/components/dialogs/error.component";
import { PublishDialogLoadingComponent } from "@/components/dialogs/loading.component";
import { ConfirmationDialogComponent } from "@/components/dialogs/confirmation/confirmation-dialog.component";
import {
	TableComponent,
	TableColumn,
	Action,
} from "../../subcomponents/table/table.component";
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";

// Model
import {
	Version,
	type CreateVersionModel,
	type VersionModel,
} from "@/models/version.model";
import { CreateChartModel } from "@/models/chart.model";

// Service
import {
	ChartFormData,
	ChartPublishHandler,
	initialChartFormData,
} from "@/services/publish/handlers/chart-publish.handler";
import { VersionService } from "@/services/api/version.service";

// Types
import { type DialogData } from "@/services/publish/publish.service";

@Component({
	selector: "app-chart-versions-section",
	imports: [
		// Modules
		MatIconModule,
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
	readonly versions = input<VersionModel[]>([]);

	private cdr = inject(ChangeDetectorRef);
	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	readonly versionService = inject(VersionService);
	readonly chartPublishHandler = inject(ChartPublishHandler);

	readonly versionTable =
		viewChild.required<TableComponent<VersionModel>>("versionTable");

	versionsColumns: TableColumn<VersionModel>[] = [
		{
			columnDef: "index",
			header: "Version",
			cell: (item: VersionModel) => `${item.index}`,
		},
		{
			columnDef: "publishedAt",
			header: "Published At",
			cell: (item: VersionModel) => `${item.publishedAt.toDateString()}`,
		},
		{
			columnDef: "downloads",
			header: "Downloads",
			cell: (item: VersionModel) => `${item.downloadsAmount ?? 0}`,
		},
	];

	versionsActions: Action<VersionModel>[] = [
		{
			description: "Download",
			icon: "download",
			href: (_, item) => item.bundleUrl,
			disabled: () => false,
		},
		{
			description: "Switch version",
			icon: "swap_horiz",
			callback: () => {
				this.openSnackBar("Not implemented yet.", "Close");
			},
			disabled: (index, item) => {
				// If it's a update, we already have versionTable available
				// Since we only update the table data, and not "versions" array
				// we need to check the table data directly
				const versionTable = this.versionTable();
				if (versionTable) {
					return (
						item.id ===
						versionTable.dataSource.data[
							versionTable.dataSource.data.length - 1
						].id
					);
				} else {
					// If it's the initial load, we need to check the versions array,
					// since it stores the initial data, and we don't have the table data yet
					return index === this.versions().length - 1;
				}
			},
		},
		{
			description: "Delete version",
			icon: "delete_forever",
			callback: this.openRemoveVersionDialog.bind(this),
			// We only allow deleting the latest version
			disabled: (_, item) => {
				return (
					item.index === 1 || item.index !== this.versions().length
				);
			},
		},
	];

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	openAddVersionDialog(): void {
		const dialogRef = this.dialog.open(
			this.chartPublishHandler.getStepComponents()[2],
			{
				data: {
					title: "Upload Chart",
					description:
						"Upload a new version of your chart. Ensure your file meets the submission guidelines.",
					formData: { ...initialChartFormData },
					inactive: [],
					mode: "uploading",
				} as DialogData<CreateChartModel>,
			},
		);

		dialogRef
			.afterClosed()
			.subscribe(async (result: ChartFormData | "back" | undefined) => {
				if (result == "back" || result == undefined) return;

				const data =
					await this.chartPublishHandler.preprocessFormData(result);

				this.dialog.open(PublishDialogLoadingComponent);

				this.addVersion(data);
			});
	}

	openRemoveVersionDialog(_: number, version: VersionModel): void {
		console.log("Removing version", version);

		const operation = async () => {
			const result = await this.versionService.deleteVersion(
				this.chartId(),
				version.id,
			);

			if (!result) {
				throw new Error("An error occurred");
			}

			this.removeVersionFromTable(version);
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

	async addVersion(version: CreateVersionModel) {
		try {
			const response = await this.versionService.addVersion(
				this.chartId(),
				version,
			);

			if (!response) {
				this.dialog.closeAll();
				this.dialog.open(ErrorDialogComponent, {
					data: {
						message: "Failed to submit chart.",
						error: "No response from server.",
					},
				});
				return;
			}

			console.log("Version added with success:", response);

			this.addVersionToTable(Version.parse(response));

			this._snackBar.open("Version added with success!", "Close");
			this.dialog.closeAll();
		} catch (error: any) {
			console.error("Failed to add new version:", error);

			this.dialog.closeAll();
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Failed to add new version.",
					error: error.message,
				},
			});
		}
	}

	addVersionToTable(version: VersionModel) {
		this.versionTable().addData(version);
		this.openSnackBar("Version added with success!", "Close");
		this.cdr.detectChanges();
	}

	removeVersionFromTable(version: VersionModel) {
		this.versionTable().removeData(version);

		// Decrement index for versions with higher index than the removed one
		this.versionTable().updateTableData((items) =>
			items.map(
				(item) =>
					item.index > version.index
						? { ...item, index: item.index - 1 }
						: item, // Keep other items unchanged
			),
		);

		this.cdr.detectChanges();
		this.openSnackBar("Version removed with success!", "Close");
	}
}
