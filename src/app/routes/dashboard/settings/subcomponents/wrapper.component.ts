import { Component } from "@angular/core";

@Component({
	selector: "app-settings-wrapper",
	template: `
		<section class="flex flex-col items-center justify-start w-full">
			<ng-content></ng-content>
		</section>
	`,
})
export class SettingsWrapperComponent {}
