import { Component, input } from "@angular/core";

// Models
import type { ThemeModel } from "@/models/theme.model";

@Component({
	selector: "app-theme-art",
	host: {
		class: "relative flex flex-row items-end justify-center w-full",
	},
	templateUrl: "./theme-art.component.html",
})
export class ThemeArtComponent {
	readonly theme = input.required<ThemeModel>();
}
