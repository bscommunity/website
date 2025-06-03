import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
	selector: "app-terms-of-service",
	imports: [MatButtonModule, MatTooltipModule, RouterLink],
	template: `
		<div
			class="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-8"
		>
			<h1 class="text-6xl font-bold tracking-wide">bscm</h1>
			<h2 class="text-2xl text-center">
				We don't have a landing page yet 😃
			</h2>
			<div
				class="flex flex-row items-center justify-center gap-4 mt-4 flex-wrap"
			>
				<div matTooltip="Coming soon!">
					<button mat-flat-button disabled>Access dashboard</button>
				</div>
				<button mat-flat-button routerLink="/release-notes">
					Check release notes
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
