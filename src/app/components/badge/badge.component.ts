import { Component, input } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
	selector: "app-badge",
	imports: [MatButtonModule, MatIconModule, MatTooltipModule],
	template: `
		<span
			class="bg-primary w-6 h-6 rounded-full flex items-center justify-center text-on-primary text-xl"
			#tooltip="matTooltip"
			[matTooltip]="label()"
			matTooltipPosition="above"
		>
			<mat-icon class="w-4! h-4! text-base! leading-none!">{{
				icon()
			}}</mat-icon>
		</span>
	`,
})
export class BadgeComponent {
	icon = input<string>("star");
	label = input<string>("Badge");
}
