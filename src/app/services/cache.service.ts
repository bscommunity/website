import { Injectable, inject } from "@angular/core";
import { StorageService } from "./storage.service";
import { CookieService } from "./cookie.service";

const ENTITY_PREFIX = "_e";
const QUERY_PREFIX = "_q";
const ENTITY_TYPE_MAP: Record<string, string> = {
	CHART: "chart",
	TOUR_PASS: "tourpass",
	THEME: "theme",
};

export type STORAGE = "persistent" | "session";

/**
 * Public-facing shape returned to services — full items resolved
 * from the entity cache, not from the query cache (ids only).
 */
export interface QueryPage<T> {
	items: T[];
	total: number | null;
}

/**
 * Shape stored in localStorage/sessionStorage for every query cache
 * entry. Only ids + metadata — entities live in the entity cache
 * under `_e:{type}:{id}`.
 */
interface QueryCacheEntry {
	ids: string[];
	entityTypes: Record<string, string>;
	totalCount: number | null;
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
	// Query cache — normalized: stores only id[] + metadata, entities live in
	// the entity cache.  The old `QueryEntry<T>` (full-object cache) is gone.
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
			const entry = JSON.parse(raw) as QueryCacheEntry;
			if (entry.ttl && Date.now() - entry.cachedAt > entry.ttl) {
				this.removeQuery(type, paramsKey, storage);
				return null;
			}
			const items: T[] = [];
			for (const id of entry.ids) {
				const entityType = entry.entityTypes[id];
				const entity = this.getEntity<unknown>(entityType, id);
				if (entity === null) return null;
				items.push(entity as T);
			}
			return { items, total: entry.totalCount };
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
		const items = data.items as Array<{ id: string; type?: string }>;
		const ids = items.map((i) => i.id);
		const entityTypes: Record<string, string> = {};
		for (const item of items) {
			entityTypes[item.id] = this.resolveEntityType(item.type, type);
		}
		const entry: QueryCacheEntry = {
			ids,
			entityTypes,
			totalCount: data.total,
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
	 * Seed items into the entity cache.  When items have a `.type` field
	 * (e.g. `CatalogItemModel` with `"CHART"` / `"TOUR_PASS"`) the
	 * entity type is derived from it, otherwise `type` is used as-is.
	 * Every list-fetching method should call this before setQuery so
	 * that subsequent getQuery calls can resolve ids -> entities.
	 */
	upsertEntities(type: string, items: Array<{ id: string; type?: string }>): void {
		for (const item of items) {
			const entityType = this.resolveEntityType(item.type, type);
			this.setEntity(entityType, item.id, item);
		}
	}

	/**
	 * Remove one item (by id) from every cached query result of `type`.
	 * Only touches the id array — entity cache is unaffected (caller
	 * should call removeEntity separately if needed).
	 */
	removeFromQueryResults<T extends { id: string }>(
		type: string,
		itemId: string,
		storage?: STORAGE,
	): void {
		this.mutateQueryResults(type, storage, (entry) => {
			const ids = entry.ids.filter((id) => id !== itemId);
			if (ids.length === entry.ids.length) return entry;
			const { [itemId]: _, ...entityTypes } = entry.entityTypes;
			return {
				...entry,
				ids,
				entityTypes,
				totalCount:
					entry.totalCount !== null
						? Math.max(0, entry.totalCount - 1)
						: null,
			};
		});
	}

	/**
	 * Insert a freshly created item into every cached query result of `type`.
	 * Only stores the id + entity type mapping; the full entity data must
	 * have already been placed in the entity cache via setEntity/upsertEntities.
	 */
	insertIntoQueryResults<T extends { id: string }>(
		type: string,
		item: T,
		storage?: STORAGE,
	): void {
		this.mutateQueryResults(type, storage, (entry) => {
			if (entry.ids.includes((item as any).id)) return entry;
			const id = (item as any).id;
			return {
				...entry,
				ids: [id, ...entry.ids],
				entityTypes: {
					...entry.entityTypes,
					[id]: this.resolveEntityType((item as any).type, type),
				},
				totalCount:
					entry.totalCount !== null ? entry.totalCount + 1 : null,
			};
		});
	}

	/**
	 * Update/remove are now entity-cache-only operations — query cache
	 * stores only ids, not item data.  This method is kept as a no-op
	 * so existing call sites don't break, but callers should rely on
	 * setEntity / updateEntity / removeEntity instead.
	 *
	 * @deprecated No-op — update entity cache directly instead.
	 */
	updateInQueryResults<T extends { id: string }>(
		_type: string,
		_itemId: string,
		_updater: (item: T) => T,
		_storage?: STORAGE,
	): void {
		// no-op: entity data is in entity cache, not query cache
	}

	// ---------------------------------------------------------------------------
	// Internals
	// ---------------------------------------------------------------------------

	/**
	 * Map a CatalogItem type string to the entity cache key.
	 * When `itemType` is absent, fall back to the query type prefix
	 * (works for homogeneous query types like `chart:dashboard`).
	 */
	private resolveEntityType(itemType: string | undefined, queryType: string): string {
		if (itemType && ENTITY_TYPE_MAP[itemType]) {
			return ENTITY_TYPE_MAP[itemType];
		}
		if (queryType.startsWith("chart")) return "chart";
		if (queryType === "tourpass") return "tourpass";
		return queryType;
	}

	/**
	 * Single shared traversal used by insert/remove above. Reads every
	 * cached entry for `type`, runs `mutator`, writes back only if it changed.
	 */
	private mutateQueryResults(
		type: string,
		storage: STORAGE | undefined,
		mutator: (entry: QueryCacheEntry) => QueryCacheEntry,
	): void {
		this.forEachQueryKey(type, storage, (key, s) => {
			const raw = this.storageService.getItem(key, s === "session");
			if (!raw) return;
			try {
				const entry = JSON.parse(raw) as QueryCacheEntry;
				const mutated = mutator(entry);
				if (mutated !== entry) {
					this.storageService.setItem(
						key,
						JSON.stringify(mutated),
						s === "session",
					);
				}
			} catch {
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
