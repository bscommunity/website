import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";

// Icons
import { NgGlyph } from "@ng-icons/core";

@Component({
	selector: "app-panel",
	template: `
		<div
			class="flex flex-col md:flex-row items-start md:items-center justify-start gap-4 rounded-lg px-6 py-4 w-full"
			[ngClass]="{
				'bg-info/50': variant() === 'info',
				'bg-[#E8A940]/50': variant() === 'warning',
			}"
		>
			@switch (variant()) {
				@case ("info") {
					<ng-glyph name="info" />
				}
				@case ("warning") {
					<ng-glyph name="warning" />
				}
				@default {
					<ng-glyph name="info" />
				}
			}
			<p class="text-sm flex-1">
				<ng-content></ng-content>
			</p>
		</div>
	`,
	imports: [NgGlyph, MatButtonModule, CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
	readonly variant = input<"info" | "warning">("info");
}
