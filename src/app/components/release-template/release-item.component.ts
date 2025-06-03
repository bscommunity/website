import { Component, input, Input } from "@angular/core";

// Components
import { MatIcon } from "@angular/material/icon";

@Component({
	selector: "app-release-template-item",
	imports: [MatIcon],
	template: `
		<div
			class="flex flex-col justify-center items-start gap-4 overflow-hidden"
		>
			<div
				class="inline-flex justify-start items-center gap-3 overflow-hidden"
			>
				<span
					class="flex self-center text-inherit leading-none select-none text-lg"
				>
					<mat-icon inline>
						{{ icon() }}
					</mat-icon>
				</span>
				<div
					class="relative justify-center text-base font-medium leading-snug"
				>
					{{ title() }}
				</div>
			</div>
			<ul
				class="flex flex-col justify-start items-start gap-3 md:gap-1 overflow-hidden list-disc list-inside text-on-background text-base font-normal leading-snug"
			>
				@for (item of content(); track $index) {
					<li
						class="flex-1 relative justify-center first-letter:capitalize"
					>
						{{ item }}
					</li>
				}
			</ul>
		</div>
	`,
})
export class ReleaseTemplateItemComponent {
	title = input<string>();
	icon = input<string>();
	content = input<string[]>();
}
