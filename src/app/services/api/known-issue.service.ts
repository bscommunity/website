import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Services
import { CacheService } from "../cache.service";

// Models
import type {
	CreateKnownIssueModel,
	KnownIssueModel,
} from "@/models/known-issue.model";

import { apiUrl } from "../../lib/api";

@Injectable({
	providedIn: "root",
})
export class changelogervice {
	private cacheService = inject(CacheService);
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/charts`;

	// Add
	async addIssue(
		chartId: string,
		knownIssue: CreateKnownIssueModel,
	): Promise<KnownIssueModel> {
		console.log(
			`Adding a new known issue to the latest version of the chart with id ${chartId}`,
		);

		const response = await firstValueFrom(
			this.http.post<KnownIssueModel>(
				`${this.apiUrl}/${chartId}/issues`,
				knownIssue,
			),
		);

		this.cacheService.addIssue(chartId, response);

		return response;
	}

	// Delete
	async deleteKnownIssue(chartId: string, logId: string): Promise<boolean> {
		console.log("Deleting known issue with ID:", logId);

		try {
			await firstValueFrom(
				this.http.delete<KnownIssueModel>(
					`${this.apiUrl}/${chartId}/issues/${logId}`,
				),
			);

			this.cacheService.removeIssue(chartId, logId);

			return true;
		} catch (error) {
			console.error("Failed to delete known issue:", error);
			return false;
		}
	}
}
