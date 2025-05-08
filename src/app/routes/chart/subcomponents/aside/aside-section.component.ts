import { Component, Input } from "@angular/core";

@Component({
	selector: "app-aside-section",
	template: `
		<div class="flex flex-col items-start justify-start gap-4 w-full">
			@if (title) {
				<h3 class="text-sm font-medium">{{ title }}</h3>
			}
			<ul
				class="flex flex-col items-start justify-start gap-2 font-medium text-base w-full"
			>
				<ng-content></ng-content>
			</ul>
		</div>
	`,
})
export class AsideSectionComponent {
	@Input() title: string | null | undefined = null;
}
