import { Component, inject, Input, ViewChild } from "@angular/core";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

// Components
import { UploadDialogErrorComponent } from "@/components/upload/generic/error.component";
import {
	TableComponent,
	TableColumn,
	Action,
} from "../../subcomponents/table/table.component";
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";
import { ConfirmationDialogComponent } from "../../dialogs/confirmation/confirmation-dialog.component";
import {
	UploadFormData,
	uploadStepComponents,
} from "@/services/upload.service";

// Model
import { CreateVersionModel, VersionModel } from "@/models/version.model";
import { VersionService } from "@/services/api/version.service";
import { UploadDialogLoadingComponent } from "@/components/upload/generic/loading.component";

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
	@Input() chartId!: string;
	@Input() versions: VersionModel[] = [];

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	readonly versionService = inject(VersionService);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	@ViewChild("versionTable") versionTable!: TableComponent<VersionModel>;

	openAddVersionConfirmationDialog(): void {
		const dialogRef = this.dialog.open(uploadStepComponents[2], {
			data: {},
		});

		dialogRef.afterClosed().subscribe((result: UploadFormData | "back") => {
			if (result == "back") return;

			this.dialog.open(UploadDialogLoadingComponent);

			const { chartFileData, ...rest } = result;
			this.addVersion({
				chartId: this.chartId,
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
				this.chartId,
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
			columnDef: "id",
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
					"Version switching is currently not implemented",
					"Close",
				);
			},
			disabled: (index, _) =>
				index === 1 || index === this.versions.length - 1,
		},
		{
			description: "Delete version",
			icon: "delete_forever",
			callback: this.openRemoveVersionConfirmationDialog.bind(this),
			disabled: (index, item: VersionModel) => {
				return index === 0 || index === this.versions.length - 1;
			},
		},
	];

	async addVersion(version: CreateVersionModel) {
		try {
			const response = await this.versionService.addVersion(
				this.chartId,
				version,
			);
			console.log("Version added successfully:", response);

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

	removeVersionFromTable(version: VersionModel) {
		this.versionTable.removeData(version);
		this.openSnackBar("Version removed with success!", "Close");
	}
}
