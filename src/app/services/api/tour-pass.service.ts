import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

import { TourPass, type CreateTourPassModel, type TourPassModel } from "@/models/tour-pass.model";

import { apiUrl } from "@/lib/api";
import { CacheService } from "../cache.service";

@Injectable({
	providedIn: "root",
})
export class TourPassService {
	private http = inject(HttpClient);
	private cacheService = inject(CacheService);

	private readonly apiUrl = `${apiUrl}/tourpasses`;

	async getTourPassById(id: string, disableCache = false): Promise<TourPassModel> {
		if (!disableCache) {
			const cached = this.cacheService.getEntity<TourPassModel>("tourpass", id);
			if (cached) return cached;
		}

		const tourPass = await firstValueFrom(
			this.http.get<TourPassModel>(`${this.apiUrl}/${id}`),
		);

		this.cacheService.upsertEntities("tourpass", [tourPass]);
		return tourPass;
	}

	async createTourPass(
		payload: CreateTourPassModel & { coverFile?: File | null },
		publishSessionId?: string,
	): Promise<TourPassModel> {
		const { coverFile, ...tourpassData } = payload;

		const formData = new FormData();
		formData.append("tourpass", JSON.stringify(tourpassData));

		if (coverFile) {
			formData.append("cover", coverFile);
		}

		const headers: Record<string, string> = {};
		if (publishSessionId) {
			headers["X-Publish-Session-Id"] = publishSessionId;
		}

		const result = TourPass.parse(
			await firstValueFrom(
				this.http.post<TourPassModel>(this.apiUrl, formData, { headers }),
			),
		);

		this.cacheService.upsertEntities("tourpass", [result]);
		this.cacheService.insertIntoQueryResults("tourpass", result);
		this.cacheService.insertIntoQueryResults("upload", result);
		return result;
	}

	async updateTourPass(
		id: string,
		payload: Partial<CreateTourPassModel> & { coverFile?: File | null },
	): Promise<TourPassModel> {
		const { coverFile, ...tourpassData } = payload;

		const formData = new FormData();
		formData.append("tourpass", JSON.stringify(tourpassData));

		if (coverFile) {
			formData.append("cover", coverFile);
		}

		const result = await firstValueFrom(
			this.http.put<TourPassModel>(`${this.apiUrl}/${id}`, formData),
		);

		this.cacheService.upsertEntities("tourpass", [result]);
		return result;
	}

	async deleteTourPass(id: string): Promise<void> {
		await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
		this.cacheService.removeEntity("tourpass", id);
		this.cacheService.removeFromQueryResults("tourpass", id);
		this.cacheService.removeFromQueryResults("upload", id);
	}
}
