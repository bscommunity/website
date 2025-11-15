import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

import { ThemePickerComponent } from "@/components/theme-picker/theme-picker.component";
import { StatusDisplayComponent } from "@/components/status-display/status-display.component";

@Component({
	selector: "app-footer",
	imports: [
		MatButtonModule,
		MatIconModule,
		RouterLink,
		ThemePickerComponent,
		StatusDisplayComponent,
	],
	templateUrl: "./footer.component.html",
})
export class FooterComponent {}
