import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class StorageService {
	/**
	 * Checks if the code is running in a browser environment.
	 * Throws an error if `window` is undefined.
	 * @throws {Error} If not running in a browser.
	 */
	private checkWindow(): void {
		if (typeof window === "undefined") {
			throw new Error("StorageService can only be used in a browser.");
		}
	}

	/**
	 * Stores a key-value pair in the specified storage.
	 *
	 * @param key - The key under which the value will be stored.
	 * @param value - The value to store.
	 * @param useSession - If true, uses sessionStorage; otherwise, uses localStorage. Defaults to false.
	 */
	setItem(key: string, value: string, useSession: boolean = false): void {
		this.checkWindow();
		const storage = useSession
			? window.sessionStorage
			: window.localStorage;
		storage.setItem(key, value);
	}

	/**
	 * Retrieves the value associated with the given key from the specified storage.
	 *
	 * @param key - The key of the item to retrieve.
	 * @param useSession - If true, uses sessionStorage; otherwise, uses localStorage. Defaults to false.
	 * @returns The value associated with the key, or null if not found.
	 */
	getItem(key: string, useSession: boolean = false): string | null {
		this.checkWindow();
		const storage = useSession
			? window.sessionStorage
			: window.localStorage;
		return storage.getItem(key);
	}

	/**
	 * Removes the item associated with the given key from the specified storage.
	 *
	 * @param key - The key of the item to remove.
	 * @param useSession - If true, uses sessionStorage; otherwise, uses localStorage. Defaults to false.
	 */
	removeItem(key: string, useSession: boolean = false): void {
		this.checkWindow();
		const storage = useSession
			? window.sessionStorage
			: window.localStorage;
		storage.removeItem(key);
	}

	/**
	 * Clears all items from the specified storage.
	 *
	 * @param useSession - If true, clears sessionStorage; otherwise, clears localStorage. Defaults to false.
	 */
	clear(useSession: boolean = false): void {
		this.checkWindow();
		const storage = useSession
			? window.sessionStorage
			: window.localStorage;
		storage.clear();
	}
}
