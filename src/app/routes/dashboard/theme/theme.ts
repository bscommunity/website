import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router, TitleStrategy } from "@angular/router";

// Modules
import { FormsModule } from "@angular/forms";
import { NgGlyph } from "@ng-icons/core";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AsideComponent } from "./subcomponents/aside/aside.component";
import { VersionsSectionComponent } from "./sections/versions/versions.component";
import { DangerZoneComponent } from "./sections/danger-zone/danger-zone.component";
import { PageError } from "../../error/error";

// Models
import { ThemeModel } from "@/models/theme.model";

// Providers
import { ThemeTitleStrategy } from "./theme-title.strategy";

@Component({
	selector: "app-theme",
	imports: [
		FormsModule,
		MatButtonModule,
		MatTooltipModule,
		AsideComponent,
		VersionsSectionComponent,
		DangerZoneComponent,
		PageError,
	],
	providers: [{ provide: TitleStrategy, useClass: ThemeTitleStrategy }],
	templateUrl: "./theme.html",
})
export class Theme implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);

	set theme(value: ThemeModel) {
		this._theme = value;
	}

	get theme(): ThemeModel {
		return this._theme;
	}

	private _theme!: ThemeModel;

	ngOnInit(): void {
		this.route.params.subscribe(() => {
			this.theme = this.route.snapshot.data["theme"];

			console.log("Theme data:", this.theme);

			if (!this.theme) {
				this.router.navigate(["error"], {
					state: { error: "Theme data is incomplete" },
				});
			}
		});
	}

	onThemeUpdated(updated: ThemeModel) {
		this.theme = updated;
	}
}
