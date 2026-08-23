import { Component, inject, input, output } from "@angular/core";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { AsideSectionComponent } from "@/components/aside-section/aside-section.component";
import { AsideContainerComponent } from "@/components/aside-container/aside-container.component";
import { ThemeArtComponent } from "@/components/theme-preview/art/theme-art.component";

// Models
import { ThemeModel } from "@/models/theme.model";

// Services
import { ThemeService } from "@/services/api/theme.service";

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
