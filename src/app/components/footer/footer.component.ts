import { Component, inject, OnInit } from "@angular/core";
import { DOCUMENT } from "@angular/common";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

import {
	CustomSelectComponent,
	type Option,
} from "@/components/custom-select/custom-select.component";

import { ThemeService } from "@/services/theme.service";
import { StorageService } from "@/services/storage.service";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-footer",
	imports: [
		MatButtonModule,
		MatIconModule,
		CustomSelectComponent,
		RouterLink,
	],
	templateUrl: "./footer.component.html",
	styleUrl: "./footer.component.scss",
})
export class FooterComponent implements OnInit {
	private storageService = inject(StorageService);
	private themeService = inject(ThemeService);

	private document = inject(DOCUMENT);

	themeOptions: Option[] = [
		{ label: "Auto", value: "auto", icon: "tonality" },
		{ label: "Light", value: "light", icon: "wb_sunny" },
		{ label: "Dark", value: "dark", icon: "nights_stay" },
	];

	theme: Option = this.themeOptions[0]; // Default selection

	languageOptions = [
		{ label: "English", value: "en" },
		{ label: "Spanish", value: "es" },
	];

	ngOnInit(): void {
		this.theme =
			this.themeOptions.find(
				(option) =>
					option.value === this.storageService.getItem("theme"),
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
