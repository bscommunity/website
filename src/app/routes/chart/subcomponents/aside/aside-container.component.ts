import { Component, input } from "@angular/core";

import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-aside-container",
	imports: [MatIconModule],
	template: `
		<li
			class="flex flex-row items-center justify-center gap-3 bg-surface-container border border-surface-container-high rounded px-5 py-2 w-full {{
				asideContainerClass()
			}}"
		>
			@if (icon()) {
				<span
					><mat-icon class="leading-none align-middle" inline>{{
						icon()
					}}</mat-icon></span
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
