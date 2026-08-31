import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Services
import { CacheService } from "../cache.service";

// Models
import type { ChartModel } from "@/models/chart.model";
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

	private readonly apiUrl = `${apiUrl}/contributors`;

	/**
	 * Contributors can hang off any catalog item (charts and themes),
	 * so every mutation must be mirrored into each entity cache that
	 * actually exists for the item id. Detail pages resolve their data
	 * from these entries (e.g. ThemeResolver -> getThemeById reads the
	 * "theme" entity), so missing one leaves the UI stale after reload.
	 */
	private updateCachedContributors(
		catalogItemId: string,
		updater: (currentContributors: ContributorModel[]) => ContributorModel[],
	): void {
		for (const entityType of ["chart", "theme"] as const) {
			if (this.cacheService.getEntity(entityType, catalogItemId) === null) {
				continue;
			}

			this.cacheService.updateEntity<ChartModel>(
				entityType,
				catalogItemId,
				(item) => ({
					...(item ?? ({} as ChartModel)),
					contributors: updater(item?.contributors ?? []),
				}),
			);
		}
	}

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

		this.updateCachedContributors(chartId, (currentContributors) => {
			const updatedUserIds = new Set(response.map((c) => c.user.id));
			const filtered = currentContributors.filter(
				(c) => !updatedUserIds.has(c.user.id),
			);
			return [...filtered, ...response];
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

		this.updateCachedContributors(chartId, (currentContributors) => {
			const updatedUserIds = new Set(updatedContributors.map((c) => c.user.id));
			const filtered = currentContributors.filter(
				(c) => !updatedUserIds.has(c.user.id),
			);
			return [...filtered, ...updatedContributors];
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

			this.updateCachedContributors(chartId, (currentContributors) =>
				currentContributors.filter(
					(contributor) =>
						role
							? !(contributor.user.id === id && contributor.role === role)
							: contributor.user.id !== id,
				),
			);

			return true;
		} catch (error) {
			console.error("Failed to delete contributor:", error);
			return false;
		}
	}

	// Self-removal
	async removeSelfAsContributor(catalogItemId: string): Promise<boolean> {
		console.log("Removing self as contributor from", catalogItemId);

		try {
			await firstValueFrom(
				this.http.delete<void>(`${this.apiUrl}/${catalogItemId}/self`),
			);

			this.updateCachedContributors(catalogItemId, (currentContributors) =>
				currentContributors,
			);

			return true;
		} catch (error) {
			console.error("Failed to remove self as contributor:", error);
			return false;
		}
	}
}
