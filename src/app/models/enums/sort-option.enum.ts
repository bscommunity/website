export enum SortOption {
	WEEKLY_RANK = "WEEKLY_RANK",
	LAST_UPDATED = "LAST_UPDATED",
	MOST_DOWNLOADED = "MOST_DOWNLOADED",
	MOST_LIKED = "MOST_LIKED",
	ALPHA_ASC = "ALPHA_ASC",
	ALPHA_DESC = "ALPHA_DESC",
}

export const getSortOptionLabel = (option: SortOption): string => {
	switch (option) {
		case SortOption.WEEKLY_RANK:
			return "Weekly Rank";
		case SortOption.LAST_UPDATED:
			return "Last Updated";
		case SortOption.MOST_DOWNLOADED:
			return "Most Downloaded";
		case SortOption.MOST_LIKED:
			return "Most Liked";
		case SortOption.ALPHA_ASC:
			return "Alphabetical A-Z";
		case SortOption.ALPHA_DESC:
			return "Alphabetical Z-A";
		default:
			return "Unknown";
	}
};
