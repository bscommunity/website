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

// Models
import type { ThemeModel } from "@/models/theme.model";

@Component({
	selector: "app-theme-preview",
	imports: [
		CommonModule,
		NgGlyph,
		MatButtonModule,
		MatRippleModule,
		MatTooltipModule,
		RouterLink,
	],
	templateUrl: "./theme-preview.component.html",
})
export class ThemePreviewComponent {
	readonly theme = input.required<ThemeModel>();

	readonly routerLink = input<string | string[] | UrlTree | null | undefined>(
		null,
	);

	private shareService = inject(ShareService);

	onShare(event?: MouseEvent | KeyboardEvent) {
		if (event) {
			event.stopPropagation();
		}
		const url = `${window.location.origin}/link/theme/${this.theme()?.id}`;
		this.shareService.share(url);
	}
}
