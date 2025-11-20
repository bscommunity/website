import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-workshop-screen",
	imports: [CommonModule, MatIconModule],
	templateUrl: "./workshop-screen.component.html",
})
export class WorkshopScreenComponent {}
