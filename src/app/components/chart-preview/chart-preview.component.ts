import { RouterLink, UrlTree } from "@angular/router";
import { Component, Input } from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";

// Components
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";

// Models
import { ChartModel } from "@/models/chart.model";

// Libs
import { transformDuration } from "@/lib/time";
import { CommonModule } from "@angular/common";

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
	@Input() chart!: ChartModel;

	transformDuration = transformDuration;

	@Input() routerLink: string | any[] | UrlTree | null | undefined = null;

	tendencyNeutral = Tendency.Neutral;
	tendencyUp = Tendency.Up;
	tendencyDown = Tendency.Down;
}
