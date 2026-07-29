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

	clearCache(): void {
		this.storageService.clear();
		this.storageService.clear(true);
		this.cookieService.delete("lastRefresh");
	}
}
