import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Services
import { CacheService } from "../cache.service";

// Models
import { ContributorRole } from "@/models/enums/role.enum";
import {
	ContributorModel,
	SimplifiedContributorModel,
} from "@/models/contributor.model";

import { apiUrl } from "../../lib/api";

@Injectable({
	providedIn: "root",
})
export class ContributorService {
	private cacheService = inject(CacheService);
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/contributors/chart`;

	// Add
	async addContributors(
		chartId: string,
		contributors: SimplifiedContributorModel[],
	): Promise<void> {
		console.log(`Adding ${contributors.length} contributors to ${chartId}`);
		const response = await firstValueFrom(
			this.http.post<ContributorModel[]>(
				`${this.apiUrl}/${chartId}`,
				{
					contributors: contributors,
				},
			),
		);

		this.cacheService.updateChart(chartId, (chart) => {
			const currentContributors = chart.contributors || [];
			const updatedUserIds = new Set(response.map((c) => c.user.id));
			const filtered = currentContributors.filter(
				(c) => !updatedUserIds.has(c.user.id),
			);
			return {
				...chart,
				contributors: [...filtered, ...response],
			};
		});
		console.log("Contributors added successfully!", response);
	}

	// Update
	async updateContributor(
		chartId: string,
		userId: string,
		roles: ContributorRole[],
	): Promise<ContributorModel[]> {
		console.log("Updating contributor roles for user:", userId);
		const updatedContributors = await firstValueFrom(
			this.http.put<ContributorModel[]>(
				`${this.apiUrl}/${chartId}/${userId}`,
				{
					roles,
				},
			),
		);

		this.cacheService.updateChart(chartId, (chart) => {
			const currentContributors = chart.contributors || [];
			const updatedUserIds = new Set(updatedContributors.map((c) => c.user.id));
			const filtered = currentContributors.filter(
				(c) => !updatedUserIds.has(c.user.id),
			);
			return {
				...chart,
				contributors: [...filtered, ...updatedContributors],
			};
		});
		return updatedContributors;
	}

	// Delete
	async deleteContributor(
		chartId: string,
		id: string,
		role?: ContributorRole,
	): Promise<boolean> {
		console.log("Removing contributor:", id, role ?? "(all roles)");

		try {
			await firstValueFrom(
				this.http.delete<ContributorModel>(
					`${this.apiUrl}/${chartId}/${id}`,
					{
						params: role ? { role } : {},
					},
				),
			);

			this.cacheService.updateChart(chartId, (chart) => ({
				...chart,
				contributors: (chart.contributors || []).filter(
					(contributor) =>
						role
							? !(contributor.user.id === id && contributor.role === role)
							: contributor.user.id !== id,
				),
			}));

			return true;
		} catch (error) {
			console.error("Failed to delete contributor:", error);
			return false;
		}
	}
}
