import { Component, computed, input } from "@angular/core";
import { CommonModule } from "@angular/common";

// Ng Icons
import { NgIcon, NgGlyph } from "@ng-icons/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatRippleModule } from "@angular/material/core";

// Components
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";

// Models
import { TourPassModel } from "@/models/tour-pass.model";
import { Visibility } from "@/models/enums/visibility.enum";

// Variants
import { tourpassCover } from "./tourpass-cover.variants";
import { getAverageDifficulty } from "@/lib/difficulty";

@Component({
	selector: "app-tourpass-cover",
	imports: [
		CommonModule,
		NgIcon,
		NgGlyph,
		MatTooltipModule,
		MatRippleModule,
		DifficultyMarkComponent,
	],
	templateUrl: "./tourpass-cover.component.html",
})
export class TourpassCoverComponent {
	tourpass = input.required<TourPassModel>();
	size = input<"sm" | "md">("md");
	showVisibility = input<boolean>(false);

	classes = computed(() =>
		tourpassCover({
			size: this.size(),
		}),
	);

	isPublic = (tourPass: TourPassModel): boolean =>
		tourPass.visibility === Visibility.PUBLIC;

	averageDifficulty = computed(() => {
		return getAverageDifficulty(this.tourpass().charts);
	});

	get discordLink(): string {
		return `https://discord.com/channels/951981656301006878/1404808964163768361/${this.tourpass().id}`;
	}
}
