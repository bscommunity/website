import { Component, input } from "@angular/core";

import { NgGlyph } from "@ng-icons/core";

@Component({
	selector: "app-aside-container",
	imports: [NgGlyph],
	template: `
		<li
			class="flex flex-row items-center justify-center gap-3 bg-surface-container border border-surface-container-high rounded px-5 py-2 w-full {{
				asideContainerClass()
			}}"
		>
			@if (icon()) {
				<span
					><ng-glyph [name]="icon()!" class="leading-none align-middle" /></span
				>
			}
			<span>{{ info() }}</span>
		</li>
	`,
})
export class AsideContainerComponent {
	readonly icon = input<string>();
	readonly info = input("[placeholder]");
	readonly asideContainerClass = input("");
}
