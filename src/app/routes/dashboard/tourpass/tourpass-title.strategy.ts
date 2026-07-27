import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { TitleStrategy, RouterStateSnapshot } from "@angular/router";

// Models
import { TourPassModel } from "@/models/tour-pass.model";

@Injectable({ providedIn: "root" })
export class TourpassTitleStrategy extends TitleStrategy {
	private readonly title = inject(Title);

	override updateTitle(routerState: RouterStateSnapshot): void {
		const pageTitle = this.buildTitle(routerState);

		if (pageTitle !== undefined) {
			this.title.setTitle(pageTitle);
		} else {
			const tourpass = routerState.root.firstChild?.data[
				"tourpass"
			] as TourPassModel;
			if (tourpass && tourpass.name) {
				this.title.setTitle(tourpass.name);
			} else {
				this.title.setTitle("Tour Pass");
			}
		}
	}
}
