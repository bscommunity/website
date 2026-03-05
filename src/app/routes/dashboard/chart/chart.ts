import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router, TitleStrategy } from "@angular/router";

// Modules
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AsideComponent } from "./subcomponents/aside/aside.component";
import { changelogComponent } from "./sections/known-issues/known-issues.component";
import { ContributorsComponent } from "./sections/contributors/contributors.component";
import { DangerZoneComponent } from "./sections/danger-zone/danger-zone.component";
import { PageError } from "../../error/error";

// Models
import { ChartModel } from "@/models/chart.model";
import { VersionsComponent } from "./sections/versions/versions.component";

// Enums
import { getDifficultyIcon } from "@/models/enums/difficulty.enum";

// Providers
import { ChartTitleStrategy } from "./chart-title.strategy";

@Component({
	selector: "app-chart",
	imports: [
		FormsModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule,
		AsideComponent,
		changelogComponent,
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

	set chart(value: ChartModel) {
		this._chart = value;
	}

	get chart(): ChartModel {
		return this._chart;
	}

	private _chart!: ChartModel;

	difficultyIcon: string | null = null;

	ngOnInit(): void {
		// Listen to route parameter changes to reload the chart
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

			if (this.chart.latestVersion) {
				this.difficultyIcon = getDifficultyIcon(
					this.chart.latestVersion.difficulty,
				);
			}
		});
	}
}
