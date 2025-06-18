import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

// Material
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

// Components
import { SettingsWrapperComponent } from "./subcomponents/wrapper.component";
import { SettingsCardComponent } from "./subcomponents/card.component";

@Component({
	selector: "app-settings",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	imports: [
		MatTabsModule,
		MatButtonModule,
		MatSlideToggleModule,
		MatIconModule,
		SettingsWrapperComponent,
		SettingsCardComponent,
	],
	templateUrl: "./settings.html",
	styleUrl: "./settings.css",
})
export class Settings {
	isChecked = true;

	deleteAccount() {
		// Logic to delete the account
		console.log("Account deletion logic goes here.");
	}

	connectGoogleDrive() {
		// Logic to connect Google Drive
		console.log("Google Drive connection logic goes here.");
	}
}
