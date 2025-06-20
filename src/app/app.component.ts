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
	authService = inject(AuthService);
	private themeService = inject(ThemeService);
	private router = inject(Router);
	private renderer = inject(Renderer2);

	showHeader = false;
	showFooter = false;

	constructor() {
		const authService = this.authService;

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
			"deluxe",
			sanitizer.bypassSecurityTrustResourceUrl("assets/icons/deluxe.svg"),
		);

		// Hiding header/footer on specific routes (e.g., login, signup)
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((event) => {
				const dashboardRoutes = [
					"/overview",
					"/published",
					"/chart",
					"/settings",
				];

				this.showHeader =
					dashboardRoutes.some((route) =>
						event.urlAfterRedirects.startsWith(route),
					) && authService.isLoggedIn();

				const disableFooter = ["/login", "/callback", "/error", "/404"];

				this.showFooter = !disableFooter.some((route) =>
					event.urlAfterRedirects.includes(route),
				);
			});
	}

	ngOnInit(): void {
		this.themeService.listenToThemeChanges(this.renderer);
	}
}
