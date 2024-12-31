// biome-ignore lint/style/useImportType: OnInit is used as implementation of an interface
import { Component, inject, OnInit } from "@angular/core";
import { DOCUMENT } from "@angular/common";

import {
	type MatSelectChange,
	MatSelectModule,
} from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";

// biome-ignore lint/style/useImportType: ThemeService is used as dependency injection token
import { ThemeService } from "../../services/theme.service";

@Component({
	selector: "app-footer",
	imports: [MatSelectModule, MatButtonModule],
	templateUrl: "./footer.component.html",
})
export class FooterComponent implements OnInit {
	private document = inject(DOCUMENT);

	constructor(private themeService: ThemeService) {}

	theme: string | null = null;

	options = [
		{ label: "Auto", value: null },
		{ label: "Light", value: "light" },
		{ label: "Dark", value: "dark" },
	];

	ngOnInit(): void {
		this.theme = this.themeService.isDarkMode() ? "dark" : "light";
	}

	onThemeChange(event: MatSelectChange) {
		console.log(event.value);
		if (event.value === "light") {
			this.document.body.classList.remove("dark");
		} else if (event.value === "dark") {
			this.document.body.classList.add("dark");
		} else {
			this.themeService.setInitialTheme(null);
		}
	}
}
