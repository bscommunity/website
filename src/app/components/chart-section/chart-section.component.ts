import { Component, input } from "@angular/core";

@Component({
	selector: "app-chart-section",
	imports: [],
	template: `
		<div class="flex flex-col items-start justify-start gap-4">
			@if (title()) {
				<div class="flex items-center justify-between gap-4 w-full">
					<h3 class="text-base font-medium">{{ title() }}</h3>
					<ng-content select="section-header"></ng-content>
				</div>
			}
			<ng-content select="section-body"></ng-content>
			<ng-content></ng-content>
		</div>
	`,
})
export class ChartSectionComponent {
	readonly title = input<string | undefined>(undefined);
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
