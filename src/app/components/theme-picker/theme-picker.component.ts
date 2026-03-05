import { AfterViewInit, Component, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";

import {
	SelectComponent,
	type Option,
} from "@/components/select/select.component";

// Services
import { ThemeService } from "@/services/theme.service";
import { StorageService } from "@/services/storage.service";

@Component({
	selector: "app-theme-picker",
	imports: [SelectComponent],
	templateUrl: "./theme-picker.component.html",
	styleUrl: "./theme-picker.component.scss",
})
export class ThemePickerComponent implements AfterViewInit {
	private storageService = inject(StorageService);
	private themeService = inject(ThemeService);

	private document = inject(DOCUMENT);

	themeOptions: Option[] = [
		{ label: "Auto", value: "auto", icon: "tonality" },
		{ label: "Light", value: "light", icon: "wb_sunny" },
		{ label: "Dark", value: "dark", icon: "nights_stay" },
	];

	theme: Option = this.themeOptions[0]; // Default selection

	ngAfterViewInit() {
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
