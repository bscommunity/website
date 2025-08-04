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

function similarity(s1: string, s2: string) {
	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length) {
		longer = s2;
		shorter = s1;
	}
	var longerLength = longer.length;
	if (longerLength == 0) {
		return 1.0;
	}
	return (
		(longerLength - editDistance(longer, shorter)) /
		parseFloat(longerLength.toString())
	);
}

function editDistance(s1: string, s2: string) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
			if (i == 0) costs[j] = j;
			else {
				if (j > 0) {
					var newValue = costs[j - 1];
					if (s1.charAt(i - 1) != s2.charAt(j - 1))
						newValue =
							Math.min(Math.min(newValue, lastValue), costs[j]) +
							1;
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0) costs[s2.length] = lastValue;
	}
	return costs[s2.length];
}

export { compareArrays, compareMaps, elementToKey, similarity };
