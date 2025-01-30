import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	Renderer2,
	inject,
} from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";

import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";

import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry, MatIconModule } from "@angular/material/icon";

import { ThemeService } from "./services/theme.service";
import { AuthService } from "./auth/auth.service";
import { filter } from "rxjs";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	imports: [MatIconModule, RouterOutlet, HeaderComponent, FooterComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	showHeaderFooter = false;

	constructor(
		public authService: AuthService,
		private themeService: ThemeService,
		private router: Router,
		private renderer: Renderer2,
	) {
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

		// Hiding header/footer on specific routes (e.g., login, signup)
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((event) => {
				// List of routes to exclude header and footer
				const dashboardRoutes = [
					"/overview",
					"/published",
					"/chart",
					"/settings",
				];

				this.showHeaderFooter =
					dashboardRoutes.includes(
						(event as NavigationEnd).urlAfterRedirects,
					) && authService.isLoggedIn();
			});
	}

	ngOnInit(): void {
		this.themeService.listenToThemeChanges(this.renderer);
	}
}
