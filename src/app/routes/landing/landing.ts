import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
	selector: "app-landing",
	imports: [MatButtonModule, MatTooltipModule, RouterLink],
	templateUrl: "./landing.html",
})
export class LandingComponent {
	// This component is intentionally left empty as it serves as a placeholder
	// for the landing page of the application.
}
