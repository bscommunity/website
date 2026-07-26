import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Services
import { CacheService } from "../cache.service";

// Models
import { CreateVersionModel, VersionModel } from "@/models/version.model";

import { apiUrl } from "@/lib/api";

@Injectable({
	providedIn: "root",
})
export class VersionService {
	private cacheService = inject(CacheService);
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/charts`;

	// Add
	async addVersion(
		chartId: string,
		version: CreateVersionModel,
	): Promise<VersionModel> {
		console.log(`Adding a new version to chart with id ${chartId}`);

		const formData = new FormData();

		// Append the version data as a JSON string under the "version" key
		const { chartBundle, ...versionData } = version;
		formData.append("version", JSON.stringify(versionData));

		if (chartBundle) {
			// Append the bundle file under the "bundle" key
			formData.append("bundle", chartBundle);
		}

		const response = await firstValueFrom(
			this.http.post<VersionModel>(
				`${this.apiUrl}/${chartId}/versions`,
				formData,
			),
		);

		this.cacheService.updateChart(chartId, (chart) => ({
			...chart,
			latestVersion: response,
			versionsCount: chart.versionsCount + 1,
		}));

		return response;
	}

	// Delete
	async deleteVersion(chartId: string, versionId: string): Promise<boolean> {
		console.log("Deleting version with ID:", versionId);

		try {
			await firstValueFrom(
				this.http.delete<VersionModel>(
					`${this.apiUrl}/versions/${versionId}`,
				),
			);

			this.cacheService.removeChart(chartId);

			return true;
		} catch (error) {
			console.error("Failed to delete version:", error);
			return false;
		}
	}
}
