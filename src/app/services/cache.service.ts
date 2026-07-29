import { Injectable, inject } from "@angular/core";
import { StorageService } from "./storage.service";
import { CookieService } from "./cookie.service";

const ENTITY_PREFIX = "_e";
const QUERY_PREFIX = "_q";

export type STORAGE = "persistent" | "session";

@Injectable({ providedIn: "root" })
export class CacheService {
	private storageService = inject(StorageService);
	private cookieService = inject(CookieService);

	// ---------------------------------------------------------------------------
	// Generic Entity Cache — type + id scoped keys
	// ---------------------------------------------------------------------------

	getEntity<T>(type: string, id: string, storage: STORAGE = "persistent"): T | null {
		const raw = this.storageService.getItem(
			`${ENTITY_PREFIX}:${type}:${id}`,
			storage === "session",
		);
		if (!raw) return null;
		try {
			return JSON.parse(raw).data as T;
		} catch {
			return null;
		}
	}

	setEntity<T>(type: string, id: string, data: T, storage: STORAGE = "persistent"): void {
		this.storageService.setItem(
			`${ENTITY_PREFIX}:${type}:${id}`,
			JSON.stringify({ data }),
			storage === "session",
		);
	}

	removeEntity(type: string, id: string, storage: STORAGE = "persistent"): void {
		this.storageService.removeItem(
			`${ENTITY_PREFIX}:${type}:${id}`,
			storage === "session",
		);
	}

	updateEntity<T>(
		type: string,
		id: string,
		updater: (current: T | null) => T,
		storage: STORAGE = "persistent",
	): void {
		const current = this.getEntity<T>(type, id, storage);
		this.setEntity(type, id, updater(current), storage);
	}

	// ---------------------------------------------------------------------------
	// Generic Query Cache — type + paramsKey scoped, with TTL
	// ---------------------------------------------------------------------------

	getQuery<T>(type: string, paramsKey: string, storage: STORAGE = "session"): T | null {
		const raw = this.storageService.getItem(
			`${QUERY_PREFIX}:${type}:${paramsKey}`,
			storage === "session",
		);
		if (!raw) return null;
		try {
			const entry = JSON.parse(raw);
			if (entry.ttl && Date.now() - entry.cachedAt > entry.ttl) {
				this.removeQuery(type, paramsKey, storage);
				return null;
			}
			return entry.data as T;
		} catch {
			this.removeQuery(type, paramsKey, storage);
			return null;
		}
	}

	setQuery<T>(
		type: string,
		paramsKey: string,
		data: T,
		storage: STORAGE = "session",
		ttlMs?: number,
	): void {
		this.storageService.setItem(
			`${QUERY_PREFIX}:${type}:${paramsKey}`,
			JSON.stringify({ data, cachedAt: Date.now(), ttl: ttlMs ?? null }),
			storage === "session",
		);
	}

	removeQuery(type: string, paramsKey: string, storage: STORAGE = "session"): void {
		this.storageService.removeItem(
			`${QUERY_PREFIX}:${type}:${paramsKey}`,
			storage === "session",
		);
	}

	invalidateQueries(type: string, storage?: STORAGE): void {
		const storages: STORAGE[] = storage ? [storage] : ["session", "persistent"];
		for (const s of storages) {
			const store = s === "session" ? window.sessionStorage : window.localStorage;
			const prefix = `${QUERY_PREFIX}:${type}:`;
			const toRemove: string[] = [];
			for (let i = 0; i < store.length; i++) {
				const key = store.key(i)!;
				if (key.startsWith(prefix)) {
					toRemove.push(key);
				}
			}
			for (const key of toRemove) {
				this.storageService.removeItem(key, s === "session");
			}
		}
	}

	removeFromQueryResults(type: string, itemId: string, storage?: STORAGE): void {
		const storages: STORAGE[] = storage ? [storage] : ["session", "persistent"];
		for (const s of storages) {
			const store = s === "session" ? window.sessionStorage : window.localStorage;
			const prefix = `${QUERY_PREFIX}:${type}:`;
			for (let i = 0; i < store.length; i++) {
				const key = store.key(i)!;
				if (!key.startsWith(prefix)) continue;
				const raw = this.storageService.getItem(key, s === "session");
				if (!raw) continue;
				try {
					const entry = JSON.parse(raw);
					const mutated = this.removeItemFromPayload(entry.data, itemId);
					if (mutated !== entry.data) {
						entry.data = mutated;
						this.storageService.setItem(key, JSON.stringify(entry), s === "session");
					}
				} catch {
					// skip malformed entries
				}
			}
		}
	}

	private removeItemFromPayload(data: unknown, itemId: string): unknown {
		if (Array.isArray(data)) {
			if (data.length >= 2 && Array.isArray(data[0])) {
				const filtered = data[0].filter((item: any) => item.id !== itemId);
				if (filtered.length === data[0].length) return data;
				const count = typeof data[1] === "number" ? data[1] - 1 : data[1];
				return [filtered, count, ...data.slice(2)];
			}
			return data;
		}

		if (data && typeof data === "object" && !Array.isArray(data)) {
			const obj = data as Record<string, unknown>;

			if (Array.isArray(obj["first"]) && typeof obj["second"] === "number") {
				const first = obj["first"] as any[];
				const filtered = first.filter((item: any) => item.id !== itemId);
				if (filtered.length === first.length) return data;
				return { ...obj, first: filtered, second: (obj["second"] as number) - 1 };
			}

			if (Array.isArray(obj["items"])) {
				const items = obj["items"] as any[];
				const filtered = items.filter((item: any) => item.id !== itemId);
				if (filtered.length === items.length) return data;
				const result: Record<string, unknown> = { ...obj, items: filtered };
				const counts = obj["counts"];
				if (counts && typeof counts === "object") {
					const item = items.find((it: any) => it.id === itemId);
					if (item?.type) {
						const countKey = this.typeToCountKey(item.type);
						const newCounts = { ...(counts as Record<string, number>) };
						if (countKey && typeof newCounts[countKey] === "number") {
							newCounts[countKey] = Math.max(0, newCounts[countKey] - 1);
						}
						result["counts"] = newCounts;
					}
				}
				return result;
			}
		}

		return data;
	}

	private typeToCountKey(type: string): string | null {
		switch (type) {
			case "CHART": return "charts";
			case "TOUR_PASS": return "tourPasses";
			case "THEME": return "themes";
			case "COLLECTION": return "collections";
			default: return null;
		}
	}

	clearCache(): void {
		this.storageService.clear();
		this.storageService.clear(true);
		this.cookieService.delete("lastRefresh");
	}
}
