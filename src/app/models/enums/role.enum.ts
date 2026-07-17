export enum ContributorRole {
	AUTHOR = "AUTHOR",
	CHART = "CHART",
	AUDIO = "AUDIO",
	REVISION = "REVISION",
	EFFECTS = "EFFECTS",
	SYNC = "SYNC",
	GAMEPLAY = "GAMEPLAY",
}

export enum UserRole {
	USER = "USER",
	MODERATOR = "MODERATOR",
	ADMIN = "ADMIN",
}

export const getContributorRoleLabel = (role: ContributorRole): string => {
	switch (role) {
		case ContributorRole.AUTHOR:
			return "Author";
		case ContributorRole.CHART:
			return "Chart";
		case ContributorRole.AUDIO:
			return "Audio";
		case ContributorRole.REVISION:
			return "Revision";
		case ContributorRole.EFFECTS:
			return "Effects";
		case ContributorRole.SYNC:
			return "Sync";
		case ContributorRole.GAMEPLAY:
			return "Gameplay";
		default:
			return "Unknown Role";
	}
};
