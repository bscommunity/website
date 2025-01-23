import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	Renderer2,
	inject,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";

import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry, MatIconModule } from "@angular/material/icon";

import { ThemeService } from "./services/theme.service";
import { AuthService } from "./auth/auth.service";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	imports: [MatIconModule, RouterOutlet, HeaderComponent, FooterComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	constructor(
		public authService: AuthService,
		private themeService: ThemeService,
		private renderer: Renderer2,
	) {
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
	}

	ngOnInit(): void {
		this.themeService.listenToThemeChanges(this.renderer);
	}
}
