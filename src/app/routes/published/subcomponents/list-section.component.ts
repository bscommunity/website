import { Component, Input } from "@angular/core";

@Component({
	selector: "app-list-section",
	imports: [],
	template: `
		<div class="flex flex-col items-start justify-start gap-4 w-full">
			<h5 class="mat-headline-small text-2xl">{{ title }}</h5>
			<ul class="grid grid-cols-2 w-full gap-6">
				<ng-content></ng-content>
			</ul>
		</div>
	`,
})
export class ListSectionComponent {
	@Input() title = "";
}
