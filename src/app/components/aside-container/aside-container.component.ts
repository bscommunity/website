import { NgClass } from "@angular/common";
import { Component, input } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { NgGlyph } from "@ng-icons/core";

@Component({
	selector: "app-aside-container",
	imports: [NgGlyph, MatProgressSpinnerModule, NgClass],
	template: `
		<li
			class="flex flex-row items-center justify-center gap-3 bg-surface-container border border-surface-container-high rounded px-5 py-2 w-full"
			[ngClass]="asideContainerClass()"
			[class.hover:bg-surface-container!]="isLoading()"
			[style.pointer-events]="isLoading() ? 'none' : 'auto'"
			[style.opacity]="isLoading() ? 0.5 : 1"
		>
			@if (isLoading()) {
				<mat-progress-spinner
					mode="indeterminate"
					diameter="20"
					class="text-primary my-0.5"
				></mat-progress-spinner>
			} @else if (info() === "N/A") {
				<span class="text-on-surface-disabled">N/A</span>
			} @else {
				@if (icon()) {
					<span
						><ng-glyph
							[name]="icon()!"
							class="leading-none align-middle"
					/></span>
				}
				<span>{{ info() }}</span>
			}
		</li>
	`,
})
export class AsideContainerComponent {
	readonly icon = input<string>();
	readonly info = input("N/A");
	readonly asideContainerClass = input("");
	readonly isLoading = input(false);
}
