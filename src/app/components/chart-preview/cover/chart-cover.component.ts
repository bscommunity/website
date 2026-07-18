import { Component, computed, input } from "@angular/core";
import { CommonModule } from "@angular/common";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatRippleModule } from "@angular/material/core";

// Components
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { Visibility } from "@/models/enums/visibility.enum";

// Variants
import { chartCover } from "./chart-cover.variants";

@Component({
	selector: "app-chart-cover",
	imports: [
		CommonModule,
		MatIconModule,
		MatTooltipModule,
		MatRippleModule,
		DifficultyMarkComponent,
	],
	templateUrl: "./chart-cover.component.html",
})
export class ChartCoverComponent {
	chart = input.required<ChartModel>();
	size = input<"sm" | "md">("md");
	showVisibility = input<boolean>(false);

	classes = computed(() =>
		chartCover({
			size: this.size(),
		}),
	);

	isPublic = (chart: ChartModel): boolean =>
		chart.visibility === Visibility.PUBLIC;

	get discordLink(): string {
		return `https://discord.com/channels/951981656301006878/1404808964163768361/${this.chart().id}`;
	}
}
