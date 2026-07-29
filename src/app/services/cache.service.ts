import { Injectable, inject } from "@angular/core";
import { StorageService } from "./storage.service";
import { CookieService } from "./cookie.service";

const ENTITY_PREFIX = "_e";
const QUERY_PREFIX = "_q";

export type STORAGE = "persistent" | "session";

/**
 * Every query/list cache entry across the app must use this shape.
 * Making every service agree on ONE shape is what lets CacheService
 * mutate cached lists generically — it only ever needs to know an
 * item has an `id`, never what a "chart" or "tourpass" looks like.
 */
export interface QueryPage<T> {
	items: T[];
	total: number | null;
}

interface QueryEntry<T> {
	data: QueryPage<T>;
	cachedAt: number;
	ttl: number | null;
}

@Injectable({ providedIn: "root" })
export class CacheService {
	private storageService = inject(StorageService);
	private cookieService = inject(CookieService);

	// ---------------------------------------------------------------------------
	// Entity cache — unchanged, this part was already solid
	// ---------------------------------------------------------------------------

	getEntity<T>(
		type: string,
		id: string,
		storage: STORAGE = "persistent",
	): T | null {
		const key = `${ENTITY_PREFIX}:${type}:${id}`;
		const raw = this.storageService.getItem(key, storage === "session");
		if (!raw) return null;
		try {
			return JSON.parse(raw).data as T;
		} catch {
			this.storageService.removeItem(key, storage === "session");
			return null;
		}
	}

	setEntity<T>(
		type: string,
		id: string,
		data: T,
		storage: STORAGE = "persistent",
	): void {
		this.storageService.setItem(
			`${ENTITY_PREFIX}:${type}:${id}`,
			JSON.stringify({ data }),
			storage === "session",
		);
	}

	removeEntity(
		type: string,
		id: string,
		storage: STORAGE = "persistent",
	): void {
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
	// Query cache — now typed around QueryPage<T> instead of `unknown`
	// ---------------------------------------------------------------------------

	getQuery<T>(
		type: string,
		paramsKey: string,
		storage: STORAGE = "session",
	): QueryPage<T> | null {
		const key = `${QUERY_PREFIX}:${type}:${paramsKey}`;
		const raw = this.storageService.getItem(key, storage === "session");
		if (!raw) return null;
		try {
			const entry = JSON.parse(raw) as QueryEntry<T>;
			if (entry.ttl && Date.now() - entry.cachedAt > entry.ttl) {
				this.removeQuery(type, paramsKey, storage);
				return null;
			}
			return entry.data;
		} catch {
			this.removeQuery(type, paramsKey, storage);
			return null;
		}
	}

	setQuery<T>(
		type: string,
		paramsKey: string,
		data: QueryPage<T>,
		storage: STORAGE = "session",
		ttlMs?: number,
	): void {
		const entry: QueryEntry<T> = {
			data,
			cachedAt: Date.now(),
			ttl: ttlMs ?? null,
		};
		this.storageService.setItem(
			`${QUERY_PREFIX}:${type}:${paramsKey}`,
			JSON.stringify(entry),
			storage === "session",
		);
	}

	removeQuery(
		type: string,
		paramsKey: string,
		storage: STORAGE = "session",
	): void {
		this.storageService.removeItem(
			`${QUERY_PREFIX}:${type}:${paramsKey}`,
			storage === "session",
		);
	}

	invalidateQueries(type: string, storage?: STORAGE): void {
		this.forEachQueryKey(type, storage, (key, s) => {
			this.storageService.removeItem(key, s === "session");
		});
	}

	/**
	 * Remove one item (by id) from every cached page of `type`, across every
	 * cached filter/sort variant — no need to know which pages exist.
	 */
	removeFromQueryResults<T extends { id: string }>(
		type: string,
		itemId: string,
		storage?: STORAGE,
	): void {
		this.mutateQueryResults<T>(type, storage, (page) => {
			const items = page.items.filter((item) => item.id !== itemId);
			if (items.length === page.items.length) return page; // unchanged -> skip write
			return {
				items,
				total: page.total !== null ? Math.max(0, page.total - 1) : null,
			};
		});
	}

	/**
	 * Insert a freshly created item into every cached page of `type`.
	 * This is the piece that was missing: it's what lets `createChart`
	 * update lists in place instead of calling invalidateQueries and
	 * forcing a refetch on the next read.
	 */
	insertIntoQueryResults<T extends { id: string }>(
		type: string,
		item: T,
		storage?: STORAGE,
	): void {
		this.mutateQueryResults<T>(type, storage, (page) => {
			if (page.items.some((existing) => existing.id === item.id))
				return page;
			return {
				items: [item, ...page.items],
				total: page.total !== null ? page.total + 1 : null,
			};
		});
	}

	/**
	 * Patch one item (by id) in place across every cached page — e.g. after
	 * an update/PUT, so lists reflect the new data without a refetch.
	 */
	updateInQueryResults<T extends { id: string }>(
		type: string,
		itemId: string,
		updater: (item: T) => T,
		storage?: STORAGE,
	): void {
		this.mutateQueryResults<T>(type, storage, (page) => {
			let changed = false;
			const items = page.items.map((item) => {
				if (item.id !== itemId) return item;
				changed = true;
				return updater(item);
			});
			return changed ? { ...page, items } : page;
		});
	}

	/**
	 * Single shared traversal used by insert/remove/update above. Reads every
	 * cached page for `type`, runs `mutator`, writes back only if it changed.
	 * Replaces the old duplicated manual loops + shape-guessing.
	 */
	private mutateQueryResults<T>(
		type: string,
		storage: STORAGE | undefined,
		mutator: (page: QueryPage<T>) => QueryPage<T>,
	): void {
		this.forEachQueryKey(type, storage, (key, s) => {
			const raw = this.storageService.getItem(key, s === "session");
			if (!raw) return;
			try {
				const entry = JSON.parse(raw) as QueryEntry<T>;
				const mutated = mutator(entry.data);
				if (mutated !== entry.data) {
					entry.data = mutated;
					this.storageService.setItem(
						key,
						JSON.stringify(entry),
						s === "session",
					);
				}
			} catch {
				// malformed entry — drop it rather than leave/propagate bad state
				this.storageService.removeItem(key, s === "session");
			}
		});
	}

	/**
	 * NOTE: this assumes StorageService exposes a `getKeysWithPrefix` method
	 * (wrapping localStorage/sessionStorage key iteration). Add it there so
	 * CacheService never touches window.localStorage/sessionStorage directly —
	 * that direct access in the original invalidateQueries/removeFromQueryResults
	 * was the one place bypassing the storage abstraction used everywhere else.
	 */
	private forEachQueryKey(
		type: string,
		storage: STORAGE | undefined,
		fn: (key: string, storage: STORAGE) => void,
	): void {
		const storages: STORAGE[] = storage
			? [storage]
			: ["session", "persistent"];
		const prefix = `${QUERY_PREFIX}:${type}:`;
		for (const s of storages) {
			const keys = this.storageService.getKeysWithPrefix(
				prefix,
				s === "session",
			);
			for (const key of keys) fn(key, s);
		}
	}

	clearCache(): void {
		this.storageService.clear();
		this.storageService.clear(true);
		this.cookieService.delete("lastRefresh");
	}
}
