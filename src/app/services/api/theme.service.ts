import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

import { Theme, type ThemeModel } from "@/models/theme.model";

import { apiUrl } from "@/lib/api";
import { CacheService } from "../cache.service";

export interface CreateThemePayload {
	name: string;
	replaces: string;
	previewUrl?: string | null;
	originalArtwork?: string | null;
	coverFile?: File | null;
	displayFile?: File | null;
	bundleFile?: File | null;
}

@Injectable({
	providedIn: "root",
})
export class ThemeService {
	private http = inject(HttpClient);
	private cacheService = inject(CacheService);

	private readonly apiUrl = `${apiUrl}/themes`;

	async getThemeById(id: string, disableCache = false): Promise<ThemeModel> {
		if (!disableCache) {
			const cached = this.cacheService.getEntity<ThemeModel>("theme", id);
			if (cached) return cached;
		}

		const theme = Theme.parse(
			await firstValueFrom(
				this.http.get<ThemeModel>(`${this.apiUrl}/${id}`),
			),
		);

		this.cacheService.upsertEntities("theme", [theme]);
		return theme;
	}

	async createTheme(
		payload: CreateThemePayload,
		publishSessionId?: string,
	): Promise<ThemeModel> {
		const { coverFile, displayFile, bundleFile, ...themeData } = payload;

		const formData = new FormData();
		formData.append("theme", JSON.stringify(themeData));

		if (coverFile) {
			formData.append("cover", coverFile);
		}

		if (displayFile) {
			formData.append("display", displayFile);
		}

		if (bundleFile) {
			formData.append("bundle", bundleFile);
		}

		const headers: Record<string, string> = {};
		if (publishSessionId) {
			headers["X-Publish-Session-Id"] = publishSessionId;
		}

		const result = Theme.parse(
			await firstValueFrom(
				this.http.post<ThemeModel>(this.apiUrl, formData, { headers }),
			),
		);

		this.cacheService.upsertEntities("theme", [result]);
		this.cacheService.insertIntoQueryResults("theme", result);
		this.cacheService.insertIntoQueryResults("upload", result);

		return result;
	}

	async updateTheme(
		id: string,
		payload: Partial<CreateThemePayload>,
	): Promise<ThemeModel> {
		const { coverFile, displayFile, ...themeData } = payload;

		const formData = new FormData();
		formData.append("theme", JSON.stringify(themeData));

		if (coverFile) {
			formData.append("cover", coverFile);
		}

		if (displayFile) {
			formData.append("display", displayFile);
		}

		const result = Theme.parse(
			await firstValueFrom(
				this.http.put<ThemeModel>(`${this.apiUrl}/${id}`, formData),
			),
		);

		this.cacheService.upsertEntities("theme", [result]);
		return result;
	}

	async deleteTheme(id: string): Promise<boolean> {
		try {
			await firstValueFrom(
				this.http.delete<ThemeModel>(`${this.apiUrl}/${id}`),
			);

			this.cacheService.removeEntity("theme", id);
			this.cacheService.removeFromQueryResults("theme", id);
			this.cacheService.removeFromQueryResults("upload", id);

			return true;
		} catch (error) {
			console.error("Error deleting theme:", error);
			return false;
		}
	}

	async getBundleUrl(id: string): Promise<string> {
		const response = await firstValueFrom(
			this.http.get<{ url: string }>(`${this.apiUrl}/${id}/bundle`),
		);
		return response.url;
	}
}
