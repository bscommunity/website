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
import { PublishVersionDialogComponent } from "../../dialogs/publish-version/publish-version-dialog.component";

// Models
import type { VersionModel } from "@/models/version.model";
import type { ThemeModel } from "@/models/theme.model";

// Services
import { ThemeService } from "@/services/api/theme.service";

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

	readonly versionTable =
		viewChild.required<TableComponent<VersionModel>>("versionTable");

	isFetchingBundle = signal(false);

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
		this.dialog.open(PublishVersionDialogComponent, {
			data: {
				themeId: this.themeId(),
				theme: this.theme(),
			},
			width: "600px",
		});
	}
}
