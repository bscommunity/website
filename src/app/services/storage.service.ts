import { isPlatformBrowser } from "@angular/common";
import { DOCUMENT, inject, Injectable, PLATFORM_ID } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class StorageService {
	private document = inject(DOCUMENT);
	private PLATFORM_ID = inject(PLATFORM_ID);
	private isBrowser = isPlatformBrowser(this.PLATFORM_ID);

	private getLocalStorage = () => this.document.defaultView?.localStorage;
	private getSessionStorage = () => this.document.defaultView?.sessionStorage;

	/**
	 * Stores a key-value pair in the specified storage.
	 *
	 * @param key - The key under which the value will be stored.
	 * @param value - The value to store.
	 * @param useSession - If true, uses sessionStorage; otherwise, uses localStorage. Defaults to false.
	 */
	setItem(key: string, value: string, useSession = false): void {
		if (!this.isBrowser) return;

		const storage = useSession
			? this.getSessionStorage()
			: this.getLocalStorage();
		storage?.setItem(key, value);
	}

	/**
	 * Retrieves the value associated with the given key from the specified storage.
	 *
	 * @param key - The key of the item to retrieve.
	 * @param useSession - If true, uses sessionStorage; otherwise, uses localStorage. Defaults to false.
	 * @returns The value associated with the key, or null if not found.
	 */
	getItem(key: string, useSession = false): string | null {
		if (!this.isBrowser) return null;

		const storage = useSession
			? this.getSessionStorage()
			: this.getLocalStorage();
		return storage?.getItem(key) || null;
	}

	/**
	 * Removes the item associated with the given key from the specified storage.
	 *
	 * @param key - The key of the item to remove.
	 * @param useSession - If true, uses sessionStorage; otherwise, uses localStorage. Defaults to false.
	 */
	removeItem(key: string, useSession = false): void {
		if (!this.isBrowser) return;

		const storage = useSession
			? this.getSessionStorage()
			: this.getLocalStorage();
		storage?.removeItem(key);
	}

	/**
	 * Returns all keys in the specified storage that start with the given prefix.
	 *
	 * @param prefix - The prefix to filter keys by.
	 * @param useSession - If true, uses sessionStorage; otherwise, uses localStorage. Defaults to false.
	 * @returns An array of matching keys.
	 */
	getKeysWithPrefix(prefix: string, useSession = false): string[] {
		if (!this.isBrowser) return [];

		const storage = useSession
			? this.getSessionStorage()
			: this.getLocalStorage();
		if (!storage) return [];

		const keys: string[] = [];
		for (let i = 0; i < storage.length; i++) {
			const key = storage.key(i);
			if (key && key.startsWith(prefix)) {
				keys.push(key);
			}
		}
		return keys;
	}

	/**
	 * Clears all items from the specified storage.
	 *
	 * @param useSession - If true, clears sessionStorage; otherwise, clears localStorage. Defaults to false.
	 */
	clear(useSession = false): void {
		if (!this.isBrowser) return;

		const storage = useSession
			? this.getSessionStorage()
			: this.getLocalStorage();
		storage?.clear();
	}
}
