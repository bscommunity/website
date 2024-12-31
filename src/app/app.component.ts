// biome-ignore lint/style/useImportType: Renderer2 is used as dependency injection token
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

// biome-ignore lint/style/useImportType: Service is used as dependency injection token
import { ThemeService } from "./services/theme.service";

@Component({
	selector: "app-root",
	imports: [MatIconModule, RouterOutlet, HeaderComponent, FooterComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
	constructor(
		private themeService: ThemeService,
		private renderer: Renderer2,
	) {
		const iconRegistry = inject(MatIconRegistry);
		const sanitizer = inject(DomSanitizer);

		iconRegistry.setDefaultFontSetClass("material-symbols-rounded");

		iconRegistry.addSvgIcon(
			"logo",
			sanitizer.bypassSecurityTrustResourceUrl("assets/images/logo.svg"),
		);
	}

	ngOnInit(): void {
		this.themeService.setInitialTheme(this.renderer);
		this.themeService.listenToThemeChanges();
	}
}
