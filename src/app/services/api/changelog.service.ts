import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Models
import type { ChartModel } from "@/models/chart.model";
import type {
	ChangelogModel,
	CreateChangelogModel,
	CreateChangelogResponseModel,
} from "@/models/changelog.model";

import { apiUrl } from "../../lib/api";
import { CacheService } from "../cache.service";

@Injectable({
	providedIn: "root",
})
export class ChangelogService {
	private http = inject(HttpClient);
	private cacheService = inject(CacheService);

	private readonly apiUrl = `${apiUrl}/charts`;

	async addEntry(
		chartId: string,
		entry: CreateChangelogModel,
	): Promise<CreateChangelogResponseModel> {
		console.log(`Adding a new changelog entry to chart with id ${chartId}`);

		const response = await firstValueFrom(
			this.http.post<CreateChangelogResponseModel>(
				`${this.apiUrl}/${chartId}/issues`,
				entry,
			),
		);

		this.cacheService.updateEntity<ChartModel>("chart", chartId, (chart) => {
			const current = chart ?? ({} as ChartModel);
			return {
				...current,
				changelog: [
					...(current.changelog || []),
					{
						id: response.id,
						description: entry.description,
						createdAt: new Date(),
					},
				],
			};
		});

		return response;
	}

	async deleteEntry(chartId: string, logId: string): Promise<boolean> {
		console.log("Deleting changelog entry with ID:", logId);

		try {
			await firstValueFrom(
				this.http.delete<ChangelogModel>(
					`${this.apiUrl}/${chartId}/issues/${logId}`,
				),
			);

			this.cacheService.updateEntity<ChartModel>("chart", chartId, (chart) => {
				const current = chart ?? ({} as ChartModel);
				return {
					...current,
					changelog: (current.changelog || []).filter(
						(entry) => entry.id !== logId,
					),
				};
			});

			return true;
		} catch (error) {
			console.error("Failed to delete changelog entry:", error);
			return false;
		}
	}
}
