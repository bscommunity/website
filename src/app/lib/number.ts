export function abbreviateNumber(value: number): string {
	const suffixes = [
		{ threshold: 1_000_000_000_000, suffix: "T" },
		{ threshold: 1_000_000_000, suffix: "B" },
		{ threshold: 1_000_000, suffix: "M" },
		{ threshold: 1_000, suffix: "K" },
	];

	const sign = value < 0 ? "-" : "";
	const abs = Math.abs(value);

	for (const { threshold, suffix } of suffixes) {
		if (abs >= threshold) {
			const scaled = abs / threshold;
			// Trim trailing .0 (e.g. "1.0K" -> "1K", but keep "1.5K")
			const formatted =
				scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
			return `${sign}${formatted}${suffix}`;
		}
	}

	return `${sign}${abs}`;
}
