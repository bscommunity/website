import { RouterLink, UrlTree } from "@angular/router";
import { Component, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Models
import { ChartModel } from "@/models/chart.model";

// Libs
import { transformDuration } from "@/lib/time";

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
	size = input<"small" | "medium" | "large">("medium");

	private _snackBar = inject(MatSnackBar);

	readonly contributorsNames = (chart: ChartModel) =>
		chart.contributors
			?.map((contributor) => contributor.user.username)
			.join(", ");

	transformDuration = transformDuration;
	showVisibility = input<boolean>(false);
	showContributors = input<boolean>(false);
	showShareActions = input<boolean>(false);

	readonly routerLink = input<string | string[] | UrlTree | null | undefined>(
		null,
	);

	/* tendencyNeutral = Tendency.Neutral;
	tendencyUp = Tendency.Up;
	tendencyDown = Tendency.Down; */

	onShare() {
		// Generate shareable link
		const url = `${window.location.origin}/link/chart/${this.chart()?.contentId}`;

		// Copy to clipboard
		navigator.clipboard.writeText(url);

		// Show snackbar
		this._snackBar.open("Chart link copied to clipboard!", "Close", {
			duration: 3000,
		});
	}
}
