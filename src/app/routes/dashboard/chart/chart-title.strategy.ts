import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { TitleStrategy, RouterStateSnapshot } from "@angular/router";

// Models
import { ChartModel } from "@/models/chart.model";

@Injectable({ providedIn: "root" })
export class ChartTitleStrategy extends TitleStrategy {
	private readonly title = inject(Title);


	override updateTitle(routerState: RouterStateSnapshot): void {
		const pageTitle = this.buildTitle(routerState);

		if (pageTitle !== undefined) {
			this.title.setTitle(pageTitle);
		} else {
			const chart = routerState.root.firstChild?.data[
				"chart"
			] as ChartModel;
			if (chart && chart.track) {
				this.title.setTitle(chart.track);
			} else {
				this.title.setTitle("Chart");
			}
		}
	}
}
