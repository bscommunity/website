import { Component } from "@angular/core";

// Modules
import { MatButtonModule } from "@angular/material/button";

// Components
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";

@Component({
	selector: "app-chart-danger-zone-section",
	imports: [ChartSectionComponent, MatButtonModule],
	templateUrl: "./danger-zone.component.html",
})
export class DangerZoneComponent {}
