import { Component, inject, Input, ViewChild } from "@angular/core";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

// Components
import { ConfirmationDialogComponent } from "../../dialogs/confirmation/confirmation-dialog.component";
import {
	TableComponent,
	TableColumn,
	Action,
} from "../../subcomponents/table/table.component";
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";

// Model
import { VersionModel } from "@/models/version.model";

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
	@Input() versions: VersionModel[] = [];

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	@ViewChild("versionTable") versionTable!: TableComponent<VersionModel>;

	openRemoveVersionConfirmationDialog(
		_: number,
		version: VersionModel,
	): void {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Version",
				description:
					"Are you sure you want to remove this version? It will not be available for download or rollback anymore.",
			},
		});

		const subscription = dialogRef.afterClosed().subscribe((result) => {
			if (result === "ok") {
				this.removeVersion(version);
				subscription.unsubscribe();
			}
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
			callback: () => {
				this.openSnackBar("Download clicked", "Close");
			},
			disabled: () => false,
		},
		{
			description: "Switch version",
			icon: "swap_horiz",
			callback: () => {
				this.openSnackBar("Switch version clicked", "Close");
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

	removeVersion(version: VersionModel) {
		this.versionTable.removeData(version);
		this.openSnackBar("Version removed with success!", "Close");
	}
}
