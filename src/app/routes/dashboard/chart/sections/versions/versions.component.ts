import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	effect,
	inject,
	input,
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
// Utils
import { getApiErrorMessage } from "@/models/api-error.model";
// Model
import {
	type CreateVersionModel,
	Version,
	type VersionModel,
} from "@/models/version.model";
import { VersionService } from "@/services/api/version.service";

// Service
import {
	type ChartFormData,
	ChartPublishHandler,
	initialChartFormData,
} from "@/services/publish/handlers/chart-publish.handler";
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
	readonly versions = input<VersionModel[]>([]);

	private cdr = inject(ChangeDetectorRef);
	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	readonly versionService = inject(VersionService);
	readonly chartPublishHandler = inject(ChartPublishHandler);

	readonly versionTable =
		viewChild.required<TableComponent<VersionModel>>("versionTable");

	// Effect to update table when versions input changes
	// This effect runs when the user creates a new chart from /chart
	constructor() {
		effect(() => {
			const versions = this.versions();
			const table = this.versionTable();

			if (table && versions.length > 0) {
				// The table data is automatically updated through the [data]="versions()" binding
				// We just need to trigger change detection
				// TODO: Manually trigger change detection?
			}
		});
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
			href: () => "",
			disabled: () => true,
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
					versions.length === 0 || item.id === versions[versions.length - 1].id
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
				},
			},
		);

		dialogRef
			.afterClosed()
			.subscribe(async (result: ChartFormData | "back" | undefined) => {
				if (result == "back" || result == undefined) return;

				/* const data =
					await this.chartPublishHandler.preprocessFormData(result);

				this.dialog.open(PublishDialogLoadingComponent);

				this.addVersion(data); */
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

			console.log("Version added with success", response);

			this.addVersionToTable(Version.parse(response));

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
		}
	}

	addVersionToTable(version: VersionModel) {
		this.versionTable().addData(version);
		this.openSnackBar("Version added with success!", "Close");
		// TODO: Manually trigger change detection?
	}

	removeVersionFromTable(version: VersionModel) {
		this.versionTable().removeData(version);

		// Decrement index for versions with higher index than the removed one
		this.versionTable().updateTableData((items) =>
			items.map(
				(item) =>
					item.versionCode > version.versionCode
						? { ...item, versionCode: item.versionCode - 1 }
						: item, // Keep other items unchanged
			),
		);

		// TODO: Manually trigger change detection?
		this.openSnackBar("Version removed with success!", "Close");
	}
}
