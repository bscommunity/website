import {
  ChangeDetectorRef,
  Component,
  inject,
  ViewChild,
  input
} from "@angular/core";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

// Components
import { UploadDialogErrorComponent } from "@/components/upload/generic/error.component";
import { UploadDialogLoadingComponent } from "@/components/upload/generic/loading.component";
import {
	TableComponent,
	TableColumn,
	Action,
} from "../../subcomponents/table/table.component";
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";
import { ConfirmationDialogComponent } from "../../dialogs/confirmation/confirmation-dialog.component";

// Service
import {
	DialogData,
	UploadFormData,
	uploadStepComponents,
} from "@/services/upload.service";
import { VersionService } from "@/services/api/version.service";

// Model
import {
	Version,
	type CreateVersionModel,
	type VersionModel,
} from "@/models/version.model";

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
	templateUrl: "./versions.component.html",
})
export class VersionsComponent {
	readonly chartId = input.required<string>();
	readonly versions = input<VersionModel[]>([]);

	private cdr = inject(ChangeDetectorRef);
	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	readonly versionService = inject(VersionService);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	@ViewChild("versionTable") versionTable!: TableComponent<VersionModel>;

	openAddVersionDialog(): void {
		const dialogRef = this.dialog.open(uploadStepComponents[2], {
			data: {
				title: "Upload Chart",
				description:
					"Upload a new version of your chart. Ensure your file meets the submission guidelines.",
				formData: {},
			} as DialogData,
		});

		dialogRef
			.afterClosed()
			.subscribe((result: UploadFormData | "back" | undefined) => {
				if (result == "back" || result == undefined) return;

				this.dialog.open(UploadDialogLoadingComponent);

				const { chartFileData, ...rest } = result;
				this.addVersion({
					chartId: this.chartId(),
					...rest,
					...chartFileData,
				});
			});
	}

	openRemoveVersionConfirmationDialog(
		_: number,
		version: VersionModel,
	): void {
		console.log("Removing version", version);

		const operation = async () => {
			const result = await this.versionService.deleteVersion(
				this.chartId(),
				version.id,
			);

			if (!result) {
				throw new Error("An error occurred");
			}
		};

		const afterOperation = () => {
			this.removeVersionFromTable(version);
			this.openSnackBar("Version removed with success!", "Close");
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Version",
				description:
					"Are you sure you want to remove this version? It will not be available for download or rollback anymore.",
				operation,
				afterOperation,
			},
		});
	}

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
			callback: (_, item: VersionModel) =>
				window.open(item.chartUrl, "_blank"),
			disabled: () => false,
		},
		{
			description: "Switch version",
			icon: "swap_horiz",
			callback: () => {
				this.openSnackBar(
					"Version switching wasn't implemented yet.",
					"Close",
				);
			},
			disabled: (index, item) => {
				// If it's a update, we already have versionTable available
				// Since we only update the table data, and not "versions" array
				// we need to check the table data directly
				if (this.versionTable) {
					return (
						item.id ===
						this.versionTable.dataSource.data[
							this.versionTable.dataSource.data.length - 1
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
			callback: this.openRemoveVersionConfirmationDialog.bind(this),
			disabled: (index, item) => {
				if (this.versionTable) {
					return (
						item.id ===
							this.versionTable.dataSource.data[
								this.versionTable.dataSource.data.length - 1
							].id ||
						item.id === this.versionTable.dataSource.data[0].id
					);
				} else {
					return index === this.versions().length - 1 || index === 0;
				}
			},
		},
	];

	async addVersion(version: CreateVersionModel) {
		try {
			const response = await this.versionService.addVersion(
				this.chartId(),
				version,
			);

			if (!response) {
				this.dialog.closeAll();
				this.dialog.open(UploadDialogErrorComponent, {
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
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					title: "Failed to add new version.",
					error: error.message,
				},
			});
		}
	}

	addVersionToTable(version: VersionModel) {
		this.versionTable.addData(version);
		this.cdr.detectChanges();
		this.openSnackBar("Version added with success!", "Close");
	}

	removeVersionFromTable(version: VersionModel) {
		this.versionTable.removeData(version);

		// Decrement index for versions with higher index than the removed one
		this.versionTable.updateTableData((items) =>
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
