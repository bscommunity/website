import { RouterLink, UrlTree } from "@angular/router";
import { Component, computed, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { tourpassPreview } from "./tourpass-preview.variants";

// Ng Icons
import { NgIcon, NgGlyph } from "@ng-icons/core";
import { ShareService } from "@/services/share.service";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Libs
import { transformDuration } from "@/lib/time";
import { TourPassModel } from "@/models/tour-pass.model";
import { TourpassCoverComponent } from "./cover/tourpass-cover.component";
import { getAverageDifficulty } from "@/lib/difficulty";

@Component({
	selector: "app-tourpass-preview",
	imports: [
		NgIcon,
		NgGlyph,
		RouterLink,
		AvatarComponent,
		CommonModule,
		MatButtonModule,
		MatRippleModule,
		MatTooltipModule,
		TourpassCoverComponent,
	],
	templateUrl: "./tourpass-preview.component.html",
})
export class TourpassPreviewComponent {
	tourpass = input.required<TourPassModel>();
	size = input<"sm" | "md">("md");
	variant = input<"default" | "static" | "selected">("default");
	fullWidth = input<boolean>(false);

	classes = computed(() =>
		tourpassPreview({
			variant: this.variant(),
			size: this.size(),
			fullWidth: this.fullWidth(),
		}),
	);

	private shareService = inject(ShareService);

	transformDuration = transformDuration;
	showItems = input<
		("visibility" | "contributors" | "shareActions" | "data")[]
	>(["data"]);

	readonly routerLink = input<string | string[] | UrlTree | null | undefined>(
		null,
	);

	averageDifficulty = computed(() => {
		return getAverageDifficulty(this.tourpass().charts);
	});

	onShare(event: MouseEvent | undefined = undefined) {
		if (event) {
			event.stopPropagation();
		}

		const url = `${window.location.origin}/link/tourpass/${this.tourpass()?.id}`;
		this.shareService.share(url);
	}
}
