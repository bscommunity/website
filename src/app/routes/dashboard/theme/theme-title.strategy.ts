import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { TitleStrategy, RouterStateSnapshot } from "@angular/router";

// Models
import { ThemeModel } from "@/models/theme.model";

@Injectable({ providedIn: "root" })
export class ThemeTitleStrategy extends TitleStrategy {
	private readonly title = inject(Title);

	override updateTitle(routerState: RouterStateSnapshot): void {
		const pageTitle = this.buildTitle(routerState);

		if (pageTitle !== undefined) {
			this.title.setTitle(pageTitle);
		} else {
			const theme = routerState.root.firstChild?.data[
				"theme"
			] as ThemeModel;
			if (theme && theme.name) {
				this.title.setTitle(theme.name);
			} else {
				this.title.setTitle("Theme");
			}
		}
	}
}
