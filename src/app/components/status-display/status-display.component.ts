import { Component, inject, OnInit, signal } from "@angular/core";

// Services
import { HttpClient } from "@angular/common/http";
import { StorageService } from "@/services/storage.service";
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
	selector: "app-status-display",
	templateUrl: "./status-display.component.html",
})
export class StatusDisplayComponent implements OnInit {
	private http = inject(HttpClient);
	private storage = inject(StorageService);

	status = signal(STATUS.LOADING);

	private loadCachedStatus() {
		const cached = this.storage.getItem("status-cache", true);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				const now = Date.now();
				if (now - parsed.timestamp < 10 * 60 * 1000) {
					// 10 minutes
					return parsed.status;
				}
			} catch (e) {
				// ignore invalid cache
				return null;
			}
		}
	}

	async fetchStatus() {
		this.http.get<Project[]>(`${apiUrl}/status`).subscribe({
			next: (projects) => {
				console.log("Fetched status:", projects);
				if (!projects) return;

				const bscm = projects.find(
					(project) => project.name === "bscm",
				);

				const status =
					bscm && bscm.incidents && bscm.incidents.length > 0
						? STATUS[bscm.incidents[0].level as keyof typeof STATUS]
						: STATUS.OK;

				if (status) {
					this.status.set(status);
					this.storage.setItem(
						"status-cache",
						JSON.stringify({
							status: this.status(),
							timestamp: Date.now(),
						}),
						true,
					);
				}
			},
			error: () => {
				// console.error("Error fetching status:", error);
				console.warn(
					"Could not fetch status, setting to OK by default.",
				);
				this.status.set(STATUS.OK);
			},
		});
	}

	ngOnInit() {
		const cachedStatus = this.loadCachedStatus();
		if (cachedStatus) {
			this.status.set(cachedStatus);
		} else {
			this.fetchStatus();
		}
	}
}
