import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Models
import type {
	CreateChangelogModel,
	ChangelogModel,
} from "@/models/changelog.model";

import { apiUrl } from "../../lib/api";

@Injectable({
	providedIn: "root",
})
export class ChangelogService {
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/charts`;

	async addEntry(
		chartId: string,
		entry: CreateChangelogModel,
	): Promise<ChangelogModel> {
		console.log(
			`Adding a new changelog entry to chart with id ${chartId}`,
		);

		return await firstValueFrom(
			this.http.post<ChangelogModel>(
				`${this.apiUrl}/${chartId}/issues`,
				entry,
			),
		);
	}

	async deleteEntry(chartId: string, logId: string): Promise<boolean> {
		console.log("Deleting changelog entry with ID:", logId);

		try {
			await firstValueFrom(
				this.http.delete<ChangelogModel>(
					`${this.apiUrl}/${chartId}/issues/${logId}`,
				),
			);

			return true;
		} catch (error) {
			console.error("Failed to delete changelog entry:", error);
			return false;
		}
	}
}
