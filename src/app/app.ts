import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	Renderer2,
	inject,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry, MatIconModule } from "@angular/material/icon";

import { ThemeService } from "./services/theme.service";

@Component({
	selector: "app-root",
	template: `<router-outlet />`,
	imports: [MatIconModule, RouterOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	private themeService = inject(ThemeService);
	private renderer = inject(Renderer2);

	constructor() {
		// Registering custom icons
		const iconRegistry = inject(MatIconRegistry);
		const sanitizer = inject(DomSanitizer);

		iconRegistry.setDefaultFontSetClass("material-symbols-rounded");

		iconRegistry.addSvgIcon(
			"logo",
			sanitizer.bypassSecurityTrustResourceUrl("assets/logos/logo.svg"),
		);

		iconRegistry.addSvgIcon(
			"label",
			sanitizer.bypassSecurityTrustResourceUrl("assets/logos/label.svg"),
		);

		iconRegistry.addSvgIcon(
			"github",
			sanitizer.bypassSecurityTrustResourceUrl("assets/logos/github.svg"),
		);

		iconRegistry.addSvgIcon(
			"discord",
			sanitizer.bypassSecurityTrustResourceUrl(
				"assets/logos/discord.svg",
			),
		);

		iconRegistry.addSvgIcon(
			"google",
			sanitizer.bypassSecurityTrustResourceUrl("assets/logos/google.svg"),
		);

		iconRegistry.addSvgIcon(
			"deluxe",
			sanitizer.bypassSecurityTrustResourceUrl("assets/icons/deluxe.svg"),
		);
	}

	ngOnInit(): void {
		this.themeService.listenToThemeChanges(this.renderer);
	}
}
