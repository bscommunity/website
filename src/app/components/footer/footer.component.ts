import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { MatButtonModule } from "@angular/material/button";
import { NgIcon } from "@ng-icons/core";

import { ThemePickerComponent } from "@/components/theme-picker/theme-picker.component";
import { StatusDisplayComponent } from "@/components/status-display/status-display.component";

@Component({
	selector: "app-footer",
	imports: [
		MatButtonModule,
		NgIcon,
		RouterLink,
		ThemePickerComponent,
		StatusDisplayComponent,
	],
	templateUrl: "./footer.component.html",
})
export class FooterComponent {}
