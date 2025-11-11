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
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";

export enum Tendency {
	Up = "up",
	Down = "down",
	Neutral = "neutral",
}

@Component({
	selector: "app-chart-preview",
	imports: [MatIconModule, RouterLink, DifficultyMarkComponent, CommonModule, MatButtonModule, MatRippleModule, MatTooltipModule],
	templateUrl: "./chart-preview.component.html",
})
export class ChartPreviewComponent {
	@Input() chart!: ChartModel;

	imageLoaded = new Map<string, boolean>();

	readonly contributorsNames = (chart: ChartModel) =>
		chart.contributors?.map((contributor) => contributor.user.username).join(", ");

	transformDuration = transformDuration;
	showVisibility = input<boolean>(false);
	showContributors = input<boolean>(false);

	readonly routerLink = input<string | any[] | UrlTree | null | undefined>(
		null,
	);

	/* tendencyNeutral = Tendency.Neutral;
	tendencyUp = Tendency.Up;
	tendencyDown = Tendency.Down; */
}
