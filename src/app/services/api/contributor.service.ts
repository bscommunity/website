import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable, tap } from "rxjs";

// Services
import { CacheService } from "../cache.service";

// Models
import { ContributorRole } from "@/models/enums/role.enum";
import {
	Contributor,
	ContributorModel,
	SimplifiedContributorModel,
} from "@/models/contributor.model";

import { apiUrl } from ".";

@Injectable({
	providedIn: "root",
})
export class ContributorService {
	private cacheService = inject(CacheService);
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/charts`;

	// Add
	async addContributors(
		chartId: string,
		contributors: SimplifiedContributorModel[],
	): Promise<void> {
		console.log(`Adding ${contributors.length} contributors to ${chartId}`);
		const response = await firstValueFrom(
			this.http.post<ContributorModel[]>(
				`${this.apiUrl}/${chartId}/contributors`,
				{
					contributors: contributors,
				},
			),
		);

		this.cacheService.updateChartContributors(chartId, response);
		console.log("Contributors added successfully!", response);
	}

	// Update
	async updateContributor(
		chartId: string,
		userId: string,
		roles: ContributorRole[],
	): Promise<ContributorModel> {
		console.log("Updating contributor with id:", userId);
		const updatedContributor = await firstValueFrom(
			this.http.put<ContributorModel>(
				`${this.apiUrl}/${chartId}/contributors/${userId}`,
				{
					roles,
				},
			),
		);

		this.cacheService.updateChartContributors(chartId, [
			updatedContributor,
		]);
		return updatedContributor;
	}

	// Delete
	async deleteContributor(chartId: string, id: string): Promise<boolean> {
		console.log("Deleting contributor with ID:", id);

		try {
			await firstValueFrom(
				this.http.delete<ContributorModel>(
					`${this.apiUrl}/${chartId}/contributors/${id}`,
				),
			);

			this.cacheService.deleteChartContributor(chartId, id);

			return true;
		} catch (error) {
			console.error("Failed to delete contributor:", error);
			return false;
		}
	}
}
