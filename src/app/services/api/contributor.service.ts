import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable, tap } from "rxjs";

import {
	Contributor,
	ContributorModel,
	SimplifiedContributorModel,
} from "@/models/contributor.model";
import { apiUrl } from ".";
import { CookieService } from "../cookie.service";
import { ContributorRole } from "@/models/enums/role.enum";

@Injectable({
	providedIn: "root",
})
export class ContributorService {
	constructor(
		private cookieService: CookieService,
		private http: HttpClient,
	) {}
	private readonly apiUrl = `${apiUrl}/charts`;

	// Add
	async addContributors(
		chartId: string,
		contributors: SimplifiedContributorModel[],
	): Promise<void> {
		console.log(`Adding ${contributors.length} contributors to ${chartId}`);
		this.http
			.post<
				ContributorModel[]
			>(`${this.apiUrl}/${chartId}/contributors`, contributors)
			.subscribe({
				next: (contributors) => {
					console.log("Contributors added successfully!");
				},
				error: (error) => {
					console.error(error);
					throw new Error(error.message);
				},
			});
	}

	// Read
	getAllContributors(): Observable<ContributorModel[]> {
		const contributors = this.cookieService.get("contributors");

		if (contributors) {
			console.log(`Returning contributors from cache...`);

			return new Observable((subscriber) => {
				subscriber.next(JSON.parse(contributors));
				subscriber.complete();
			});
		} else {
			console.log(
				"It was not possible to get cached contributors. Fetching from API...",
			);

			return this.http.get<ContributorModel[]>(this.apiUrl).pipe(
				tap((fetchedContributors) => {
					this.cookieService.set(
						"contributors",
						JSON.stringify(fetchedContributors),
					);
				}),
			);
		}
	}

	async getContributorById(id: string): Promise<ContributorModel> {
		const cacheKey = `contributor_${id}`;
		const cachedContributor = this.cookieService.get(cacheKey);

		if (cachedContributor) {
			console.log(`Returning contributor ${id} from cache...`);
			try {
				const contributor = JSON.parse(cachedContributor);
				return Contributor.parse(contributor);
			} catch (error) {
				console.error("Error parsing cached contributor:", error);
				// Fall back to API fetch if parsing fails.
			}
		}

		console.log("Fetching contributor with ID:", id);
		const response = await firstValueFrom(
			this.http.get<unknown>(`${this.apiUrl}/${id}`),
		);

		try {
			const parsedContributor = Contributor.parse(response);
			this.cookieService.set(cacheKey, JSON.stringify(parsedContributor));
			return parsedContributor;
		} catch (error) {
			console.error("Invalid data structure received:", error);
			throw new Error("Failed to fetch valid contributor data");
		}
	}

	// Update
	async updateContributor(
		chartId: string,
		userId: string,
		roles: ContributorRole[],
	): Promise<ContributorModel> {
		console.log("Updating contributor with id:", userId);
		return await firstValueFrom(
			this.http.put<ContributorModel>(
				`${this.apiUrl}/${chartId}/contributors/${userId}`,
				roles,
			),
		);
	}

	// Delete
	async deleteContributor(id: string): Promise<ContributorModel> {
		console.log("Deleting contributor with ID:", id);
		return await firstValueFrom(
			this.http.delete<ContributorModel>(`${this.apiUrl}/${id}`),
		);
	}
}
