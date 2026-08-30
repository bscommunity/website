import { Component, computed, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, UrlTree } from "@angular/router";

// Ng Icons
import { NgGlyph } from "@ng-icons/core";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";

// Services
import { ShareService } from "@/services/share.service";

// Components
import { ThemeArtComponent } from "./art/theme-art.component";

// Models
import type { ThemeModel } from "@/models/theme.model";
import { getBeatstarThemeName } from "@/models/theme/theme-genres";

// Variants
import { themePreview } from "./theme-preview.variants";

@Component({
	selector: "app-theme-preview",
	imports: [
		CommonModule,
		NgGlyph,
		MatButtonModule,
		MatRippleModule,
		MatTooltipModule,
		RouterLink,
		ThemeArtComponent,
	],
	templateUrl: "./theme-preview.component.html",
})
export class ThemePreviewComponent {
	readonly theme = input.required<ThemeModel>();
	readonly size = input<"sm" | "md">("md");
	readonly variant = input<"default" | "static" | "selected">("default");
	readonly fullWidth = input<boolean>(false);

	classes = computed(() =>
		themePreview({
			variant: this.variant(),
			size: this.size(),
			fullWidth: this.fullWidth(),
		}),
	);

	readonly routerLink = input<string | string[] | UrlTree | null | undefined>(
		null,
	);

	private shareService = inject(ShareService);

	readonly replacesName = computed(
		() => getBeatstarThemeName(this.theme().replaces) ?? this.theme().replaces,
	);

	onShare(event?: MouseEvent | KeyboardEvent) {
		if (event) {
			event.stopPropagation();
		}
		const url = `${window.location.origin}/link/theme/${this.theme()?.id}`;
		this.shareService.share(url);
	}
}
