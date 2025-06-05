import { Component, OnInit } from "@angular/core";
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
import { PageErrorComponent } from "../error/error.component";

// Models
import { ChartWithLatestVersionModel } from "@/models/chart.model";
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
		PageErrorComponent,
		PageErrorComponent,
	],
	providers: [{ provide: TitleStrategy, useClass: ChartTitleStrategy }],
	templateUrl: "./chart.component.html",
})
export class ChartComponent implements OnInit {
	constructor(
		private route: ActivatedRoute,
		private router: Router,
	) {}

	set chart(value: ChartWithLatestVersionModel) {
		this._chart = {
			...value,
			latestVersion: value.versions?.[0] || undefined,
		};
	}
	get chart(): ChartWithLatestVersionModel {
		return this._chart;
	}
	private _chart!: ChartWithLatestVersionModel;

	difficultyIcon: string | null = null;

	ngOnInit(): void {
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
			this.difficultyIcon = getDifficultyIcon(this.chart.difficulty);
		}
	}
}
