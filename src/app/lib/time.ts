export function transformDuration(value: number): string {
	const minutes = Math.floor(value / 60);
	const seconds = Math.floor(value % 60);
	return `${minutes}m${seconds}s`;
}

// eg. 2 weeks ago, 1 day ago, 3 hours ago, 5 minutes ago
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function convertDateTimeToHumanReadable(value: string | Date): string {
	const date =
		value instanceof Date
			? new Date(value)
			: new Date(value.endsWith("Z") ? value : `${value}Z`);

	if (Number.isNaN(date.getTime())) {
		return "Unknown date";
	}

	const today = new Date();
	const startOfToday = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);
	const startOfDate = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);

	const diffMs = startOfToday.getTime() - startOfDate.getTime();
	const diffDays = Math.max(0, Math.floor(diffMs / MS_PER_DAY));

	if (diffDays === 0) {
		return "Today";
	}
	if (diffDays === 1) {
		return "Yesterday";
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`;
	}

	const weeks = Math.floor(diffDays / 7);
	if (weeks < 4) {
		return weeks === 1 ? "Last week" : `${weeks} weeks ago`;
	}

	const months =
		startOfToday.getFullYear() * 12 +
		startOfToday.getMonth() -
		(startOfDate.getFullYear() * 12 + startOfDate.getMonth());
	if (months === 1) {
		return "Last month";
	}
	if (months < 12) {
		return `${months} months ago`;
	}

	const years = Math.floor(months / 12);
	return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function convertStringToMonth(value: string): string {
	if (!value || value === "unknown") return "Other";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Other";
	const options: Intl.DateTimeFormatOptions = {
		month: "long",
		year: "numeric",
	};
	return date.toLocaleDateString("en-US", options);
}
