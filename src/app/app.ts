import { Component, OnInit, Renderer2, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { ThemeService } from "./services/theme.service";

@Component({
	selector: "app-root",
	template: `<router-outlet />`,
	imports: [RouterOutlet],
})
export class App implements OnInit {
	private themeService = inject(ThemeService);
	private renderer = inject(Renderer2);

	ngOnInit(): void {
		this.themeService.listenToThemeChanges(this.renderer);
	}
}
