import { RouterLink, UrlTree } from "@angular/router";
import { Component, computed, inject, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";

// Material
import { MatIconModule } from "@angular/material/icon";
import { ShareService } from "@/services/share.service";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Models
import { ChartModel } from "@/models/chart.model";

// Enums
import { Visibility } from "@/models/enums/visibility.enum";

// Libs
import { transformDuration } from "@/lib/time";
import { twMerge } from "tailwind-merge";

export enum Tendency {
	Up = "up",
	Down = "down",
	Neutral = "neutral",
}

@Component({
	selector: "app-chart-preview",
	imports: [
		MatIconModule,
		RouterLink,
		DifficultyMarkComponent,
		AvatarComponent,
		CommonModule,
		MatButtonModule,
		MatRippleModule,
		MatTooltipModule,
	],
	templateUrl: "./chart-preview.component.html",
})
export class ChartPreviewComponent {
	chart = input.required<ChartModel>();
	size = input<"small" | "default">("default");
	class = input<string | null>(null);

	readonly hostClasses = computed(() =>
		twMerge(
			"flex flex-row items-start justify-center gap-4 bg-surface-container hover:bg-surface-container-low transition-colors duration-75 border border-outline-variant/50 rounded-xl p-4 cursor-pointer group relative",
			this.class(),
		),
	);

	private shareService = inject(ShareService);

	readonly contributorsNames = (chart: ChartModel) =>
		chart.contributors
			?.map((contributor) => contributor.user.username)
			.join(", ");

	transformDuration = transformDuration;
	showVisibility = input<boolean>(false);
	showContributors = input<boolean>(false);
	showShareActions = input<boolean>(false);
	actionIcon = input<string | null>(null);

	readonly routerLink = input<string | string[] | UrlTree | null | undefined>(
		null,
	);

	isNotPublic = (chart: ChartModel): boolean =>
		chart.visibility !== Visibility.PUBLIC;

	/* tendencyNeutral = Tendency.Neutral;
	tendencyUp = Tendency.Up;
	tendencyDown = Tendency.Down; */

	onShare(event: MouseEvent | undefined = undefined) {
		if (event) {
			event.stopPropagation();
		}

		const url = `${window.location.origin}/link/chart/${this.chart()?.id}`;
		this.shareService.share(url);
	}
}
