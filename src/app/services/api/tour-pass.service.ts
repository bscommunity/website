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

@Injectable({
	providedIn: "root",
})
export class TourPassService {
	private http = inject(HttpClient);

	private readonly apiUrl = `${apiUrl}/tourpasses`;

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

		return firstValueFrom(
			this.http.put<TourPassModel>(`${this.apiUrl}/${id}`, formData),
		);
	}

	async deleteTourPass(id: string): Promise<void> {
		await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
	}
}
