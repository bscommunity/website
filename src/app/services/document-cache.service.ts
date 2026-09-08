import { Injectable, inject } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { StorageService } from "./storage.service";
import type { STORAGE } from "./cache.service";

interface DocumentCacheEntry<T> {
	data: T;
	cachedAt: number;
}

export interface DocumentFetchOptions {
	ttlMs: number;
	disableCache?: boolean;
	storage?: STORAGE;
}

/**
 * Simple TTL cache for whole-response documents (aggregates like the
 * dashboard overview, or single-list responses like notifications).
 *
 * Unlike CacheService — which normalizes entity lists into an id-indexed
 * entity cache plus query cache — this stores each entry as an opaque
 * blob under a caller-chosen key. Use it when the response has no
 * entities shared across multiple lists.
 *
 * Entries live in session storage by default so they are scoped to the
 * tab session and wiped on logout via CacheService.clearCache().
 */
@Injectable({ providedIn: "root" })
export class DocumentCacheService {
	private storageService = inject(StorageService);

	get<T>(key: string, ttlMs: number, storage: STORAGE = "session"): T | null {
		const raw = this.storageService.getItem(key, storage === "session");
		if (!raw) return null;

		try {
			const entry = JSON.parse(raw) as DocumentCacheEntry<T>;
			if (Date.now() - entry.cachedAt > ttlMs) {
				this.storageService.removeItem(key, storage === "session");
				return null;
			}
			return entry.data;
		} catch {
			this.storageService.removeItem(key, storage === "session");
			return null;
		}
	}

	set<T>(key: string, data: T, storage: STORAGE = "session"): void {
		const entry: DocumentCacheEntry<T> = { data, cachedAt: Date.now() };
		this.storageService.setItem(
			key,
			JSON.stringify(entry),
			storage === "session",
		);
	}

	invalidate(prefix: string, storage: STORAGE = "session"): void {
		for (const key of this.keys(prefix, storage)) {
			this.storageService.removeItem(key, storage === "session");
		}
	}

	keys(prefix: string, storage: STORAGE = "session"): string[] {
		return this.storageService.getKeysWithPrefix(
			prefix,
			storage === "session",
		);
	}

	/**
	 * Read-through cache around a cold source observable: returns the
	 * cached value on hit, otherwise subscribes to `source` and stores
	 * its emission. `disableCache` skips the read but still refreshes
	 * the entry on fetch.
	 */
	fetch<T>(
		key: string,
		source: Observable<T>,
		options: DocumentFetchOptions,
	): Observable<T> {
		const storage = options.storage ?? "session";

		if (!options.disableCache) {
			const cached = this.get<T>(key, options.ttlMs, storage);
			if (cached !== null) return of(cached);
		}

		return source.pipe(tap((data) => this.set(key, data, storage)));
	}
}
