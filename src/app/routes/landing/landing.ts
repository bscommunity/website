import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { LandingTagComponent } from "./subcomponents/tag.component";

@Component({
	selector: "app-landing",
	imports: [MatButtonModule, MatTooltipModule, MatIconModule, RouterLink, LandingTagComponent],
	templateUrl: "./landing.html",
})
export class LandingComponent {
	// This component is intentionally left empty as it serves as a placeholder
	// for the landing page of the application.
}
