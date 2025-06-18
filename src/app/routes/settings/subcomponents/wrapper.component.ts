import { Component } from "@angular/core";

@Component({
	selector: "app-settings-wrapper",
	template: `
		<section
			class="mt-6 flex flex-col gap-6 items-center justify-start w-full"
		>
			<ng-content></ng-content>
		</section>
	`,
})
export class SettingsWrapperComponent {}
