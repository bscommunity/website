export function transformDuration(value: number): string {
	const minutes = Math.floor(value / 60);
	const seconds = Math.floor(value % 60);
	return `${minutes}m${seconds}s`;
}

// eg. 2 weeks ago, 1 day ago, 3 hours ago, 5 minutes ago
export function convertDateTimeToHumanReadable(value: string): string {
	const date = new Date(value);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);

	if (weeks > 0) {
		return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
	}
	if (days > 0) {
		return days === 1 ? "1 day ago" : `${days} days ago`;
	}
	if (hours > 0) {
		return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
	}
	if (minutes > 0) {
		return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
	}
	return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
}
