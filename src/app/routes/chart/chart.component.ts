import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, TitleStrategy } from "@angular/router";

// Modules
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AsideComponent } from "./subcomponents/aside.component";
import { KnownIssuesComponent } from "./sections/known-issues/known-issues.component";
import { ContributorsComponent } from "./sections/contributors/contributors.component";
import { DangerZoneComponent } from "./sections/danger-zone/danger-zone.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { VersionModel } from "@/models/version.model";
import { VersionsComponent } from "./sections/versions/versions.component";

// Providers
import { ChartTitleStrategy } from "./chart-title.strategy";
import { PageErrorComponent } from "../error/error.component";

@Component({
	selector: "app-chart",
	imports: [
		// Modules
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
	],
	providers: [{ provide: TitleStrategy, useClass: ChartTitleStrategy }],
	templateUrl: "./chart.component.html",
})
export class ChartComponent implements OnInit {
	constructor(
		private route: ActivatedRoute,
		private router: Router,
	) {}

	chart: ChartModel | null = null;

	ngOnInit(): void {
		// Access resolved data
		this.chart = this.route.snapshot.data["chart"];

		if (!this.chart?.versions || !this.chart.contributors) {
			console.error("Chart data is incomplete", this.chart);
			this.router.navigate(["error"], {
				state: { error: "Chart data is incomplete" },
			});
		}
	}
}
