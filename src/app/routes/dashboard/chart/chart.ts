import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router, TitleStrategy } from "@angular/router";
import { CommonModule } from "@angular/common";

// Modules
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AsideComponent } from "./subcomponents/aside/aside.component";
import { KnownIssuesComponent } from "./sections/known-issues/known-issues.component";
import { ContributorsComponent } from "./sections/contributors/contributors.component";
import { DangerZoneComponent } from "./sections/danger-zone/danger-zone.component";
import { PageError } from "../../error/error";

// Models
import { ChartModel, withLatestVersion } from "@/models/chart.model";
import { VersionsComponent } from "./sections/versions/versions.component";

// Enums
import { getDifficultyIcon } from "@/models/enums/difficulty.enum";

// Providers
import { ChartTitleStrategy } from "./chart-title.strategy";

@Component({
	selector: "app-chart",
	imports: [
		// Modules
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule,
		// Components
		AsideComponent,
		KnownIssuesComponent,
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

	set chart(value: ChartModel) { this._chart = withLatestVersion(value) }

	get chart(): ChartModel {
		return this._chart;
	}

	private _chart!: ChartModel;

	difficultyIcon: string | null = null;

	ngOnInit(): void {
		// Escuta mudanças nos parâmetros da rota para recarregar o chart
		this.route.params.subscribe(() => {
			// Access resolved data
			this.chart = this.route.snapshot.data["chart"];
			console.warn("Chart data", this.chart);

			if (!this.chart?.versions || !this.chart.contributors) {
				console.error("Chart data is incomplete", this.chart);
				this.router.navigate(["error"], {
					state: { error: "Chart data is incomplete" },
				});
			}

			if (this.chart) {
				this.difficultyIcon = getDifficultyIcon(
					this.chart.latestVersion.difficulty,
				);
			}
		});
	}
}
