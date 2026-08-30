function compareMaps<K, V>(
	map1: Map<K, V[]>,
	map2: Map<K, V[]>,
	compareArrays: (arr1: V[], arr2: V[]) => boolean,
): boolean {
	if (map1.size !== map2.size) return false;

	for (const [key, array1] of map1) {
		const array2 = map2.get(key);
		if (!array2) return false; // Key missing in map2

		if (!compareArrays(array1, array2)) return false; // Arrays are not equal
	}

	return true;
}

function compareArrays<T>(
	arr1: T[],
	arr2: T[],
	toKey: (element: T) => string,
): boolean {
	if (arr1.length !== arr2.length) return false;

	const set1 = new Set(arr1.map(toKey));
	const set2 = new Set(arr2.map(toKey));

	return set1.size === set2.size && [...set1].every((key) => set2.has(key));
}

function elementToKey<T>(element: T): string {
	return `${element}`;
}

function valuesEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	// Treat null and undefined as interchangeable form values
	if (a == null && b == null) return true;
	return false;
}

/**
 * Returns true when any value in `current` differs from the matching
 * entry in `initial`. Used to detect real changes against a snapshot of
 * the form's initial values (unlike FormGroup.pristine, reverting a
 * field to its original value counts as unchanged).
 */
export function formValuesChanged(
	initial: Record<string, unknown>,
	current: Record<string, unknown>,
): boolean {
	return Object.keys(initial).some(
		(key) => !valuesEqual(current[key], initial[key]),
	);
}

export { compareArrays, compareMaps, elementToKey };
