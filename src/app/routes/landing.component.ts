import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
	selector: "app-terms-of-service",
	imports: [MatButtonModule, MatTooltipModule],
	template: `
		<div
			class="w-full min-h-screen flex flex-col items-center justify-center gap-4"
		>
			<h1 class="text-6xl font-bold tracking-wide">bscm</h1>
			<h2 class="text-2xl">We don't have a landing page yet 😃</h2>
			<div matTooltip="Coming soon!">
				<button mat-flat-button class="mt-4" disabled="">
					Access dashboard
				</button>
			</div>
		</div>
	`,
})
export class LandingComponent {
	// This component is intentionally left empty as it serves as a placeholder
	// for the landing page of the application.
	// Any future content or functionality can be added here.
}
