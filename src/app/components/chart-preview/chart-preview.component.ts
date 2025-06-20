import { RouterLink, UrlTree } from "@angular/router";
import { Component, Input, input } from "@angular/core";
import { CommonModule } from "@angular/common";

// Material
import { MatIconModule } from "@angular/material/icon";

// Components
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";

// Models
import { ChartModel } from "@/models/chart.model";

// Libs
import { transformDuration } from "@/lib/time";
import { VersionModel } from "@/models/version.model";

export enum Tendency {
	Up = "up",
	Down = "down",
	Neutral = "neutral",
}

@Component({
	selector: "app-chart-preview",
	imports: [MatIconModule, RouterLink, DifficultyMarkComponent, CommonModule],
	templateUrl: "./chart-preview.component.html",
})
export class ChartPreviewComponent {
	@Input()
	set chart(value: ChartModel) {
		this._chart = value;
		this.latestVersion = value?.versions?.[0];
	}
	get chart(): ChartModel {
		return this._chart;
	}
	private _chart!: ChartModel;

	latestVersion: VersionModel | undefined;

	transformDuration = transformDuration;

	readonly routerLink = input<string | any[] | UrlTree | null | undefined>(null);

	/* tendencyNeutral = Tendency.Neutral;
	tendencyUp = Tendency.Up;
	tendencyDown = Tendency.Down; */
}
