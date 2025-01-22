// src/app/services/config.service.ts
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class ConfigService {
	private readonly config = {
		lastFmApiKey: process.env["LASTFM_API_KEY"] || "",
	};

	get lastFmApiKey(): string {
		return this.config.lastFmApiKey;
	}
}
