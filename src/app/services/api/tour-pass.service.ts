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

	async createTourPass(payload: CreateTourPassModel): Promise<TourPassModel> {
		return firstValueFrom(
			this.http.post<TourPassModel>(this.apiUrl, payload),
		);
	}
}
