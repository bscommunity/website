// storage.service.ts
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class StorageService {
	/* constructor() {} */

	setItem(key: string, value: string): void {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(key, value);
		}
	}

	getItem(key: string): string | null {
		if (typeof window !== "undefined") {
			return window.localStorage.getItem(key);
		}
		return null;
	}

	removeItem(key: string): void {
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(key);
		}
	}

	clear(): void {
		if (typeof window !== "undefined") {
			window.localStorage.clear();
		}
	}
}
