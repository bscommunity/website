import { Component, inject, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DOCUMENT } from "@angular/common";

import { environment } from "environments/environment";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

import {
	SelectComponent,
	type Option,
} from "@/components/select/select.component";

// Services
import { ThemeService } from "@/services/theme.service";
import { StorageService } from "@/services/storage.service";
import { HttpClient } from "@angular/common/http";
import { apiUrl } from "@/lib/api";

const STATUS = {
	LOADING: {
		color: "#808080",
		text: "Fetching status...",
	},
	OK: {
		color: "#0cc415",
		text: "All systems operational",
	},
	MINOR: {
		color: "#ff8c00",
		text: "Partially degraded service",
	},
	MAJOR: {
		color: "#ff8c00",
		text: "Partially degraded service",
	},
	CRITICAL: {
		color: "#ff0000",
		text: "Major outage",
	},
};

interface Incident {
	resolved: boolean;
	level: "MINOR" | "MAJOR" | "CRITICAL";
}

interface Project {
	name: string;
	incidents: Incident[];
}

@Component({
	selector: "app-footer",
	imports: [MatButtonModule, MatIconModule, SelectComponent, RouterLink],
	templateUrl: "./footer.component.html",
	styleUrl: "./footer.component.scss",
})
export class FooterComponent implements OnInit {
	private http = inject(HttpClient);

	private storageService = inject(StorageService);
	private themeService = inject(ThemeService);

	private document = inject(DOCUMENT);

	themeOptions: Option[] = [
		{ label: "Auto", value: "auto", icon: "tonality" },
		{ label: "Light", value: "light", icon: "wb_sunny" },
		{ label: "Dark", value: "dark", icon: "nights_stay" },
	];

	theme: Option = this.themeOptions[0]; // Default selection
	status = signal(STATUS.LOADING);

	languageOptions = [{ label: "English", value: "en" }];

	async fetchStatus() {
		this.http
			.get<Project[]>(`${apiUrl}/status`)
			.subscribe({
				next: (projects) => {
					if (!projects) return;

					const bscm = projects.find(
						(project) => project.name === "bscm",
					);

					const status =
						bscm && bscm.incidents && bscm.incidents.length > 0
							? STATUS[
							bscm.incidents[0]
								.level as keyof typeof STATUS
							]
							: STATUS.OK;

					if (status) {
						this.status.set(status);
					}
				},
				error: (error) => {
					console.error("Error fetching status:", error);
				},
			});
	}

	ngOnInit() {
		this.theme =
			this.themeOptions.find(
				(option) =>
					option.value === this.storageService.getItem("theme"),
			) || this.themeOptions[0];

		// Fetch current status from the API
		this.fetchStatus();
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
