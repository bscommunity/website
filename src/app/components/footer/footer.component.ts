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

	themeOptions: Option[] = [
		{ label: "Auto", value: "auto", icon: "tonality" },
		{ label: "Light", value: "light", icon: "wb_sunny" },
		{ label: "Dark", value: "dark", icon: "nights_stay" },
		/* { value: "option1", label: "Option 1", icon: "home" },
		{ value: "option2", label: "Option 2", icon: "star" },
		{ value: "option3", label: "Option 3", icon: "favorite" },
		{ value: "option4", label: "Option 4", icon: "favorite_border" },
		{ value: "option5", label: "Option 5", icon: "favorite" },
		{ value: "option6", label: "Option 6", icon: "favorite_border" },
		{ value: "option7", label: "Option 7", icon: "favorite" },
		{ value: "option8", label: "Option 8", icon: "favorite_border" },
		{ value: "option9", label: "Option 9", icon: "favorite" },
		{ value: "option10", label: "Option 10", icon: "favorite_border" }, */
	];

	theme: Option = this.themeOptions[0]; // Default selection

	languageOptions = [
		{ label: "English", value: "en" },
		{ label: "Spanish", value: "es" },
	];

	options: Option[] = [
		{ value: "option1", label: "Option 1", icon: "home" },
		{ value: "option2", label: "Option 2", icon: "star" },
		// Add more options as needed
	];
	selectedOption: Option = this.options[0]; // Default selection

	ngOnInit(): void {
		this.theme =
			this.themeOptions.find(
				(option) => option.value === this.storageService.getItem("theme"),
			) || this.themeOptions[0];
	}

	onThemeChange(option: Option) {
		if (option.value === "light") {
			this.document.body.classList.remove("dark");
			this.storageService.setItem("theme", "light");
		} else if (option.value === "dark") {
			this.document.body.classList.add("dark");
			this.storageService.setItem("theme", "dark");
		} else {
			this.themeService.setBrowserColorScheme();
			this.storageService.removeItem("theme");
		}
	}
}
