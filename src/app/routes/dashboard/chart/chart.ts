import { Component, OnInit, inject } from "@angular/core";
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

	set chart(value: ChartModel) {
		this._chart = value;
	}

	get chart(): ChartModel {
		return this._chart;
	}

	private _chart!: ChartModel;

	difficultyIcon: string | null = null;
	tourPassId: string | null = history.state?.tourPassId ?? null;

	ngOnInit(): void {
		// Listen to route parameter changes to reload the chart
		this.route.params.subscribe(() => {
			// Access resolved data
			this.chart = this.route.snapshot.data["chart"];
			console.warn("Chart data", this.chart);

			// Update tourPassId from navigation state (may change on re-navigation)
			this.tourPassId = history.state?.tourPassId ?? null;

			if (!this.chart.contributors) {
				console.error("Chart data is incomplete", this.chart);
				this.router.navigate(["error"], {
					state: { error: "Chart data is incomplete" },
				});
			}

			if (this.chart.difficulty) {
				this.difficultyIcon = getDifficultyIcon(this.chart.difficulty);
			}
		});
	}

	onChartUpdated(updated: ChartModel) {
		this.chart = updated;

		if (updated.difficulty) {
			this.difficultyIcon = getDifficultyIcon(updated.difficulty);
		}
	}
}
