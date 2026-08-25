import { Component, computed, inject, input, output } from "@angular/core";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { AsideSectionComponent } from "@/components/aside-section/aside-section.component";
import { AsideContainerComponent } from "@/components/aside-container/aside-container.component";
import { ThemeArtComponent } from "@/components/theme-preview/art/theme-art.component";
import { EditThemeDialogComponent } from "../../dialogs/edit-theme/edit-theme-dialog.component";

// Models
import { ThemeModel } from "@/models/theme.model";

// Services
import { ThemeService } from "@/services/api/theme.service";
import {
	getBeatstarThemeGenre,
	getThemeGenreIcon,
} from "@/models/theme/theme-genres";

@Component({
	selector: "app-aside",
	templateUrl: "./aside.component.html",
	imports: [
		AsideSectionComponent,
		AsideContainerComponent,
		ThemeArtComponent,
	],
})
export class AsideComponent {
	readonly dialog = inject(MatDialog);
	readonly _snackBar = inject(MatSnackBar);
	private themeService = inject(ThemeService);

	readonly theme = input.required<ThemeModel>();
	readonly themeUpdated = output<ThemeModel>();

	readonly replacesName = input<string | undefined>(undefined);

	readonly themeIcon = computed<string | null>(() => {
		const genre = getBeatstarThemeGenre(this.theme().replaces);
		console.log("Genre for theme", this.theme().name, "is", genre);
		return genre ? getThemeGenreIcon(genre) : null;
	});

	openEditDialog() {
		const dialogRef = this.dialog.open(EditThemeDialogComponent, {
			data: {
				theme: this.theme(),
			},
			width: "560px",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result && result !== "back") {
				this.themeUpdated.emit(result);
			}
		});
	}

	async share() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			this._snackBar.open("Link copied to clipboard", "Close", {
				duration: 3000,
			});
		} catch {
			this._snackBar.open("Could not copy link", "Close", {
				duration: 3000,
			});
		}
	}

	async downloadBundle() {
		try {
			const url = await this.themeService.getBundleUrl(this.theme().id);
			window.open(url, "_blank");
		} catch {
			this._snackBar.open("Bundle download not available yet", "Close", {
				duration: 3000,
			});
		}
	}
}
