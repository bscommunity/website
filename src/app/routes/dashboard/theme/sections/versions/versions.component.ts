import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
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
import { PublishVersionDialogComponent } from "../../dialogs/publish-version/publish-version-dialog.component";

// Models
import type { VersionModel } from "@/models/version.model";

@Component({
	selector: "app-theme-versions-section",
	imports: [
		NgGlyph,
		MatButtonModule,
		ChartSectionComponent,
		TableComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./versions.component.html",
})
export class VersionsSectionComponent {
	readonly themeId = input.required<string>();
	readonly versions = input<VersionModel[]>([]);

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	readonly versionTable =
		viewChild.required<TableComponent<VersionModel>>("versionTable");

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

	versionsActions: Action<VersionModel>[] = [
		{
			description: "Download",
			icon: "download",
			callback: () => {
				this.openSnackBar("Not implemented yet.", "Close");
			},
			disabled: () => false,
		},
	];

	openAddVersionDialog(): void {
		this.dialog.open(PublishVersionDialogComponent, {
			data: {
				themeId: this.themeId(),
			},
			width: "450px",
		});
	}
}
