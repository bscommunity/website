import type { QueryPage } from "@/services/cache.service";

/**
 * Wire shapes returned by counted content listings:
 * - `{ items, total }` — uniform shape
 * - `[items, total]` / `{ first, second }` — legacy Kotlin Pair shapes
 */
export type CountedResponse<T> =
	| { items: T[]; total: number | null }
	| [T[], number | null]
	| { first: T[]; second: number | null };

/**
 * Normalize any counted content listing response into a QueryPage.
 */
export function toQueryPage<T>(response: CountedResponse<T>): QueryPage<T> {
	if (Array.isArray(response)) {
		return { items: response[0] ?? [], total: response[1] ?? null };
	}
	if ("items" in response) {
		return { items: response.items ?? [], total: response.total ?? null };
	}
	return { items: response.first ?? [], total: response.second ?? null };
}
