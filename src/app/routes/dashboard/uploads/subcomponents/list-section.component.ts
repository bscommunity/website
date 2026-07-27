import { Component, input } from "@angular/core";

@Component({
	selector: "app-list-section",
	imports: [],
	template: `
		<div class="flex flex-col items-start justify-start gap-4 w-full">
			<h5 class="mat-headline-small text-2xl">{{ title() }}</h5>
			<div class="flex flex-wrap gap-4 w-full">
				<ng-content></ng-content>
			</div>
		</div>
	`,
})
export class ListSectionComponent {
	readonly title = input("");
}
