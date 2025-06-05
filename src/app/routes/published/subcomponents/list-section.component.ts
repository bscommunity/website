import { Component, input } from "@angular/core";

@Component({
	selector: "app-list-section",
	imports: [],
	template: `
		<div class="flex flex-col items-start justify-start gap-4 w-full">
			<h5 class="mat-headline-small text-2xl">{{ title() }}</h5>
			<ul class="flex flex-col md:grid md:grid-cols-2 w-full gap-6">
				<ng-content></ng-content>
			</ul>
		</div>
	`,
})
export class ListSectionComponent {
	readonly title = input("");
}
