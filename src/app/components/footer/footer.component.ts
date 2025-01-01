// biome-ignore lint/style/useImportType: OnInit is used as implementation of an interface
import { Component, inject, OnInit, ViewEncapsulation } from "@angular/core";
import { DOCUMENT } from "@angular/common";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
	CustomSelectComponent,
	type Option,
} from "../custom-select/custom-select.component";

// biome-ignore lint/style/useImportType: ThemeService is used as dependency injection token
import { ThemeService } from "../../services/theme.service";
// biome-ignore lint/style/useImportType: StorageService is used as dependency injection token
import { StorageService } from "../../services/storage.service";

@Component({
	selector: "app-footer",
	imports: [MatButtonModule, MatIconModule, CustomSelectComponent],
	templateUrl: "./footer.component.html",
	// Encapsulation has to be disabled in order for the
	// component style to apply to the select panel.
	encapsulation: ViewEncapsulation.None,
	styleUrl: "./footer.component.scss",
})
export class FooterComponent implements OnInit {
	private document = inject(DOCUMENT);

	constructor(
		private storageService: StorageService,
		private themeService: ThemeService,
	) {}

	theme: string | null = null;

	themeOptions = [
		{ label: "Auto", value: null },
		{ label: "Light", value: "light" },
		{ label: "Dark", value: "dark" },
	];

	languageOptions = [
		{ label: "English", value: "en" },
		{ label: "Spanish", value: "es" },
	];

	options: Option[] = [
		{ value: "option1", viewValue: "Option 1", icon: "home" },
		{ value: "option2", viewValue: "Option 2", icon: "star" },
		// Add more options as needed
	];
	selectedOption: Option = this.options[0]; // Default selection

	ngOnInit(): void {
		this.theme = this.storageService.getItem("theme") ?? null;
	}

	/* onThemeChange(event: MatSelectChange) {
		if (event.value === "light") {
			this.document.body.classList.remove("dark");
			this.storageService.setItem("theme", "light");
		} else if (event.value === "dark") {
			this.document.body.classList.add("dark");
			this.storageService.setItem("theme", "dark");
		} else {
			this.themeService.setBrowserColorScheme();
			this.storageService.removeItem("theme");
		}
	} */
}
