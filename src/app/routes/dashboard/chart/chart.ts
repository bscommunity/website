import { Component, OnInit, inject, signal } from "@angular/core";
import {
	ActivatedRoute,
	Router,
	RouterLink,
	TitleStrategy,
} from "@angular/router";

// Modules
import { FormsModule } from "@angular/forms";
import { NgIcon, NgGlyph } from "@ng-icons/core";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AsideComponent } from "./subcomponents/aside/aside.component";
import { ContributorsComponent } from "./sections/contributors/contributors.component";
import { DangerZoneComponent } from "./sections/danger-zone/danger-zone.component";
import { PageError } from "../../error/error";

// Models
import { ChartModel } from "@/models/chart.model";
import { VersionsComponent } from "./sections/versions/versions.component";

// Enums
import { getDifficultyIcon } from "@/models/enums/difficulty.enum";
import { Visibility } from "@/models/enums/visibility.enum";

// Providers
import { ChartTitleStrategy } from "./chart-title.strategy";

@Component({
	selector: "app-chart",
	imports: [
		FormsModule,
		MatButtonModule,
		NgIcon,
		NgGlyph,
		MatTooltipModule,
		RouterLink,
		AsideComponent,
		ContributorsComponent,
		DangerZoneComponent,
		VersionsComponent,
		PageError,
	],
	providers: [{ provide: TitleStrategy, useClass: ChartTitleStrategy }],
	templateUrl: "./chart.html",
})
export class Chart implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);

	readonly chart = signal<ChartModel | null>(null);
	readonly difficultyIcon = signal<string | null>(null);
	readonly tourPassId = signal<string | null>(
		history.state?.tourPassId ?? null,
	);

	ngOnInit(): void {
		this.route.params.subscribe(() => {
			const data = this.route.snapshot.data["chart"];
			this.chart.set(data);
			console.warn("Chart data", data);

			this.tourPassId.set(history.state?.tourPassId ?? null);

			if (!data.contributors) {
				console.error("Chart data is incomplete", data);
				this.router.navigate(["error"], {
					state: { error: "Chart data is incomplete" },
				});
			}

			if (data.difficulty) {
				this.difficultyIcon.set(getDifficultyIcon(data.difficulty));
			}
		});
	}

	onChartUpdated(updated: ChartModel) {
		this.chart.set(updated);

		if (updated.difficulty) {
			this.difficultyIcon.set(getDifficultyIcon(updated.difficulty));
		}
	}

	onVisibilityChanged(visibility: Visibility) {
		this.chart.update((c) => (c ? { ...c, visibility } : c));
	}
}
