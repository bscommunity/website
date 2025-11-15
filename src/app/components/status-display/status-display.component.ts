import { Component, inject, OnInit, signal } from "@angular/core";

// Services
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
	selector: "app-status-display",
	templateUrl: "./status-display.component.html",
})
export class StatusDisplayComponent implements OnInit {
	private http = inject(HttpClient);

	status = signal(STATUS.LOADING);

	async fetchStatus() {
		this.http.get<Project[]>(`${apiUrl}/status`).subscribe({
			next: (projects) => {
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
				}
			},
			error: (error) => {
				console.error("Error fetching status:", error);
			},
		});
	}

	ngOnInit() {
		// Fetch current status from the API
		this.fetchStatus();
	}
}
