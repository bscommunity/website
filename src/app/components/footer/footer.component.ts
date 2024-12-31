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
// biome-ignore lint/style/useImportType: StorageService is used as dependency injection token
import { StorageService } from "../../services/storage.service";

@Component({
	selector: "app-footer",
	imports: [MatSelectModule, MatButtonModule],
	templateUrl: "./footer.component.html",
})
export class FooterComponent implements OnInit {
	private document = inject(DOCUMENT);

	constructor(
		private storageService: StorageService,
		private themeService: ThemeService,
	) {}

	theme: string | null = null;

	options = [
		{ label: "Auto", value: null },
		{ label: "Light", value: "light" },
		{ label: "Dark", value: "dark" },
	];

	ngOnInit(): void {
		this.theme = this.storageService.getItem("theme") ?? null;
	}

	onThemeChange(event: MatSelectChange) {
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
	}
}
