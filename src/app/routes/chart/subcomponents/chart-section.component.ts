import { Component, Input } from "@angular/core";

@Component({
	selector: "app-chart-section",
	imports: [],
	template: `
		<div class="flex flex-col items-start justify-start gap-4">
			<h3 class="text-base font-medium">{{ title }}</h3>
			<ng-content></ng-content>
		</div>
	`,
})
export class ChartSectionComponent {
	@Input() title = "[placeholder]";
}
