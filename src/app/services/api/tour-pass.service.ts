import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

// Models
import type {
	CreateTourPassModel,
	TourPassModel,
} from "@/models/tour-pass.model";

// Lib
import { apiUrl } from "@/lib/api";
import { StorageService } from "../storage.service";

@Injectable({
	providedIn: "root",
})
export class TourPassService {
	private http = inject(HttpClient);
	private storageService = inject(StorageService);

	private readonly apiUrl = `${apiUrl}/tourpasses`;

	async getTourPassById(id: string, disableCache = false): Promise<TourPassModel> {
		const cacheKey = `tourpass_${id}`;

		if (!disableCache) {
			const cached = this.getFromCache(cacheKey);
			if (cached) return cached;
		}

		const tourPass = await firstValueFrom(
			this.http.get<TourPassModel>(`${this.apiUrl}/${id}`),
		);

		this.setCache(cacheKey, tourPass);
		return tourPass;
	}

	async createTourPass(
		payload: CreateTourPassModel & { coverFile?: File | null },
	): Promise<TourPassModel> {
		const { coverFile, ...tourpassData } = payload;

		const formData = new FormData();
		formData.append("tourpass", JSON.stringify(tourpassData));

		if (coverFile) {
			formData.append("cover", coverFile);
		}

		return firstValueFrom(
			this.http.post<TourPassModel>(this.apiUrl, formData),
		);
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

		this.setCache(`tourpass_${id}`, result);
		return result;
	}

	async deleteTourPass(id: string): Promise<void> {
		await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
		this.removeItemFromCache(`tourpass_${id}`);
	}

	private getFromCache(key: string): TourPassModel | null {
		const raw = this.storageService.getItem(key, true);
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed === "object" && typeof parsed.id === "string") {
				return parsed as TourPassModel;
			}
		} catch {
			this.storageService.removeItem(key, true);
		}
		return null;
	}

	private setCache(key: string, data: TourPassModel): void {
		this.storageService.setItem(key, JSON.stringify(data), true);
	}

	private removeItemFromCache(key: string): void {
		this.storageService.removeItem(key, true);
	}
}
