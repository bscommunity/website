import { Component, computed, inject, input, signal } from "@angular/core";

// Material
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgGlyph } from "@ng-icons/core";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// JSZip
import JSZip from "jszip";

// Components
import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";
import {
	type Action,
	type TableColumn,
	TableComponent,
} from "../../../chart/subcomponents/table/table.component";

// Models
import type { ThemeModel } from "@/models/theme.model";
import { getBeatstarTheme } from "@/models/theme/theme-genres";

// Services
import { ThemeService } from "@/services/api/theme.service";

interface ThemeFileRow {
	image: string | null;
	file: string;
	id: string;
	blobUrl?: string;
}

const ASSET_TYPE_LABELS: Record<string, string> = {
	icon: "Icon",
	track: "Track",
	top: "Top",
	bottom: "Bottom",
	circle: "Circle",
	perfectBar: "Perfect Bar",
	perfectLine: "Perfect Line",
};

@Component({
	selector: "app-theme-files-section",
	imports: [
		NgGlyph,
		MatButtonModule,
		MatProgressSpinnerModule,
		ChartSectionComponent,
		TableComponent,
	],
	templateUrl: "./files.component.html",
})
export class FilesSectionComponent {
	readonly theme = input.required<ThemeModel>();

	private _snackBar = inject(MatSnackBar);
	private themeService = inject(ThemeService);

	readonly isLoadingBundle = signal(false);
	readonly loadedRows = signal<ThemeFileRow[]>([]);

	readonly fileRows = computed<ThemeFileRow[]>(() => {
		const theme = this.theme();
		const iconId =
			getBeatstarTheme(theme.replaces)?.assets.icon ?? theme.replaces;

		return [
			{
				image: theme.coverUrl,
				file: "Icon",
				id: iconId,
			},
			...this.loadedRows(),
		];
	});

	filesColumns: TableColumn<ThemeFileRow>[] = [
		{
			columnDef: "image",
			header: "Image",
			cell: (item: ThemeFileRow) =>
				item.image
					? `<img class="rounded w-10 h-10 object-cover" src="${item.image}" alt="${item.file}" />`
					: `<span class="flex items-center justify-center rounded w-10 h-10 bg-surface-container-high text-on-surface-variant"><span class="text-[10px]">?</span></span>`,
		},
		{
			columnDef: "file",
			header: "File",
			cell: (item: ThemeFileRow) => item.file,
		},
		{
			columnDef: "id",
			header: "Id",
			cell: (item: ThemeFileRow) => item.id,
		},
	];

	filesActions: Action<ThemeFileRow>[] = [
		{
			description: "Download file",
			icon: "download",
			callback: (_, item) => this.downloadFile(item),
			disabled: () => false,
		},
	];

	async loadRemainingFiles(): Promise<void> {
		if (this.isLoadingBundle()) return;

		this.isLoadingBundle.set(true);

		try {
			const bundle = await this.themeService.getBundleBlob(this.theme().id);
			const zip = await JSZip.loadAsync(bundle);

			const uuidToType = new Map<string, string>();
			const beatstar = getBeatstarTheme(this.theme().replaces);
			if (beatstar) {
				for (const [type, uuid] of Object.entries(beatstar.assets)) {
					if (uuid) uuidToType.set(uuid, ASSET_TYPE_LABELS[type] ?? type);
				}
			}

			const rows: ThemeFileRow[] = [];
			for (const entry of Object.values(zip.files)) {
				if (entry.dir) continue;

				const id = entry.name.split("/").pop() ?? entry.name;
				if (!id || this.fileRows().some((row) => row.id === id)) continue;

				const blob = await entry.async("blob");
				rows.push({
					image: URL.createObjectURL(blob),
					file: uuidToType.get(id) ?? "Unknown",
					id,
				});
			}

			this.loadedRows.update((current) => [...current, ...rows]);
		} catch (error) {
			console.error("Failed to load bundle files:", error);
			this._snackBar.open("Could not load the bundle files", "Close", {
				duration: 3000,
			});
		} finally {
			this.isLoadingBundle.set(false);
		}
	}

	private async downloadFile(item: ThemeFileRow): Promise<void> {
		try {
			if (!item.blobUrl) {
				const blob = await this.themeService.getBundleBlob(this.theme().id);
				item.blobUrl = URL.createObjectURL(blob);
			}

			const anchor = document.createElement("a");
			anchor.href = item.blobUrl;
			anchor.download = item.id;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
		} catch {
			this._snackBar.open("Download not available yet", "Close", {
				duration: 3000,
			});
		}
	}
}
