import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Services
import { CacheService } from "../cache.service";

// Models
import { CreateVersionModel, VersionModel } from "@/models/version.model";

import { apiUrl } from ".";

@Injectable({
	providedIn: "root",
})
export class VersionService {
	constructor(
		private cacheService: CacheService,
		private http: HttpClient,
	) {}
	private readonly apiUrl = `${apiUrl}/charts`;

	// Add
	async addVersion(
		chartId: string,
		version: CreateVersionModel,
	): Promise<VersionModel> {
		console.log(`Adding a new version to chart with id ${chartId}`);

		const response = await firstValueFrom(
			this.http.post<VersionModel>(
				`${this.apiUrl}/${chartId}/versions`,
				version,
			),
		);

		this.cacheService.addVersion(chartId, response);

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

			this.cacheService.deleteChartContributor(chartId, versionId);

			return true;
		} catch (error) {
			console.error("Failed to delete version:", error);
			return false;
		}
	}
}
