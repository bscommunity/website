import { Component, input } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

// Icons
import { NgGlyph } from "@ng-icons/core";

@Component({
	selector: "app-badge",
	imports: [MatButtonModule, MatTooltipModule, NgGlyph],
	template: `
		<span
			class="bg-primary w-6 h-6 rounded-full flex items-center justify-center text-on-primary text-xl"
			#tooltip="matTooltip"
			[matTooltip]="label()"
			matTooltipPosition="above"
		>
			<ng-glyph [name]="icon()" size="16" class="leading-none" />
		</span>
	`,
})
export class BadgeComponent {
	icon = input<string>("star");
	label = input<string>("Badge");
}
