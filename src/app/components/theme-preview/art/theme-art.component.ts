import { Component, computed, input } from "@angular/core";

// Models
import type { ThemeModel } from "@/models/theme.model";

// Variants
import { themeArt, themeArtCover, themeDisplayArt } from "./theme-art.variants";

@Component({
	selector: "app-theme-art",
	host: {
		"[class]": "classes()",
	},
	templateUrl: "./theme-art.component.html",
})
export class ThemeArtComponent {
	readonly theme = input.required<ThemeModel>();
	readonly size = input<"sm" | "md" | "lg">("md");

	classes = computed(() => themeArt());

	displayArtClasses = computed(() => themeDisplayArt({ size: this.size() }));

	coverClasses = computed(() => themeArtCover({ size: this.size() }));
}
