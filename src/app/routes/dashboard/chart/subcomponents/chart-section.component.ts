import { Component, input } from "@angular/core";

@Component({
	selector: "app-chart-section",
	imports: [],
	template: `
		<div class="flex flex-col items-start justify-start gap-4">
			<ng-content select="section-header"></ng-content>
			@if (title()) {
				<h3 class="text-base font-medium">{{ title() }}</h3>
			}
			<ng-content select="section-body"></ng-content>
		</div>
	`,
})
export class ChartSectionComponent {
	readonly title = input("");
}

@Component({
	selector: "section-header",
	imports: [],
	template: `<ng-content></ng-content>`,
})
export class SectionHeader {}

@Component({
	selector: "section-body",
	imports: [],
	template: `<ng-content></ng-content>`,
})
export class SectionBody {}
