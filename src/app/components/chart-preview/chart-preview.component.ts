import { RouterLink, UrlTree } from "@angular/router";
import { Component, computed, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { chartPreview } from "./chart-preview.variants";

// Ng Icons
import { NgIcon, NgGlyph } from "@ng-icons/core";
import { ShareService } from "@/services/share.service";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";
import { ChartCoverComponent } from "./cover/chart-cover.component";

// Models
import { ChartModel } from "@/models/chart.model";

// Libs
import { transformDuration } from "@/lib/time";

@Component({
	selector: "app-chart-preview",
	imports: [
		NgIcon,
		NgGlyph,
		RouterLink,
		AvatarComponent,
		CommonModule,
		MatButtonModule,
		MatRippleModule,
		MatTooltipModule,
		ChartCoverComponent,
	],
	templateUrl: "./chart-preview.component.html",
})
export class ChartPreviewComponent {
	chart = input.required<ChartModel>();
	size = input<"sm" | "md">("md");
	variant = input<"default" | "selected">("default");
	fullWidth = input<boolean>(false);

	classes = computed(() =>
		chartPreview({
			variant: this.variant(),
			size: this.size(),
			fullWidth: this.fullWidth(),
		}),
	);

	private shareService = inject(ShareService);

	readonly contributorsNames = (chart: ChartModel) =>
		chart.contributors
			?.map((contributor) => contributor.user.username)
			.join(", ");

	transformDuration = transformDuration;
	showItems = input<('visibility' | 'contributors' | 'shareActions' | 'data')[]>(['data']);

	readonly routerLink = input<string | string[] | UrlTree | null | undefined>(
		null,
	);

	onShare(event: MouseEvent | undefined = undefined) {
		if (event) {
			event.stopPropagation();
		}

		const url = `${window.location.origin}/link/chart/${this.chart()?.id}`;
		this.shareService.share(url);
	}
}
