import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, TitleStrategy } from "@angular/router";

// Modules
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AsideComponent } from "./subcomponents/aside/aside.component";
import { FilesSectionComponent } from "./sections/files/files.component";
import { ContributorsSectionComponent } from "./sections/contributors/contributors.component";
import { VersionsSectionComponent } from "./sections/versions/versions.component";
import { DangerZoneComponent } from "./sections/danger-zone/danger-zone.component";
import { PageError } from "../../error/error";

// Models
import { ThemeModel } from "@/models/theme.model";
import { ContributorModel } from "@/models/contributor.model";

// Providers
import { ThemeTitleStrategy } from "./theme-title.strategy";
import { getBeatstarThemeName } from "@/models/theme/theme-genres";

// Services
import { AuthService } from "@/services/auth.service";

@Component({
	selector: "app-theme",
	imports: [
		FormsModule,
		MatButtonModule,
		MatTooltipModule,
		AsideComponent,
		FilesSectionComponent,
		ContributorsSectionComponent,
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
	private authService = inject(AuthService);

	readonly theme = signal<ThemeModel | null>(null);

	readonly replacesName = computed(() => {
		const replaces = this.theme()?.replaces;
		return (replaces ? getBeatstarThemeName(replaces) : undefined) ?? replaces ?? "";
	});

	readonly isOwner = computed(() => {
		const t = this.theme();
		if (!t) return false;
		const currentUserId = this.authService.user?.id;
		if (!currentUserId) return false;
		return t.authorId === currentUserId;
	});

	readonly isContributor = computed(() => {
		const t = this.theme();
		if (!t) return false;
		const currentUserId = this.authService.user?.id;
		if (!currentUserId) return false;
		if (this.isOwner()) return false;
		return t.contributors.some(
			(contrib) => contrib.user.id === currentUserId,
		);
	});

	ngOnInit(): void {
		this.route.params.subscribe(() => {
			const data = this.route.snapshot.data["theme"];
			this.theme.set(data);

			console.log("Theme data:", data);

			if (!data) {
				this.router.navigate(["error"], {
					state: { error: "Theme data is incomplete" },
				});
			}
		});
	}

	onThemeUpdated(updated: ThemeModel) {
		this.theme.set(updated);
	}

	onContributorsChanged(contributors: ContributorModel[]) {
		this.theme.update((t) => (t ? { ...t, contributors } : t));
	}
}
