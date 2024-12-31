// biome-ignore lint/style/useImportType: Service is used as dependency injection token
import { Injectable, Renderer2, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
	providedIn: "root",
})
export class ThemeService {
	private themeQuery = "(prefers-color-scheme: dark)";
	private renderer: Renderer2 | null = null;

	// biome-ignore lint/complexity/noBannedTypes: This is a service
	constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

	public isDarkMode(): boolean {
		if (isPlatformBrowser(this.platformId)) {
			return window.matchMedia(this.themeQuery).matches;
		}
		return false;
	}

	public setBrowserColorScheme(): void {
		if (isPlatformBrowser(this.platformId)) {
			const darkMode = window.matchMedia(this.themeQuery).matches;
			this.applyTheme(darkMode);
		}
	}

	public listenToThemeChanges(renderer: Renderer2): void {
		if (isPlatformBrowser(this.platformId)) {
			this.renderer = renderer;
			const mediaQueryList = window.matchMedia(this.themeQuery);
			mediaQueryList.addEventListener("change", (event) => {
				this.applyTheme(event.matches);
			});
		}
	}

	private applyTheme(isDarkMode: boolean): void {
		if (!this.renderer) return;

		const body = document.body;
		if (isDarkMode) {
			this.renderer.addClass(body, "dark");
		} else {
			this.renderer.removeClass(body, "dark");
		}
	}
}
