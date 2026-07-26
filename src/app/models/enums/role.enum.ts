export enum ContributorRole {
	AUTHOR = "AUTHOR",
	CHART = "CHART",
	AUDIO = "AUDIO",
	REVISION = "REVISION",
	EFFECTS = "EFFECTS",
	SYNC = "SYNC",
	GAMEPLAY = "GAMEPLAY",
	ART = "ART",
	TEXTURES = "TEXTURES",
}

export enum UserRole {
	USER = "USER",
	MODERATOR = "MODERATOR",
	ADMIN = "ADMIN",
}

export const CHART_CONTRIBUTOR_ROLES: ContributorRole[] = [
	ContributorRole.CHART,
	ContributorRole.AUDIO,
	ContributorRole.REVISION,
	ContributorRole.EFFECTS,
	ContributorRole.SYNC,
	ContributorRole.GAMEPLAY,
];

export const THEME_CONTRIBUTOR_ROLES: ContributorRole[] = [
	ContributorRole.ART,
	ContributorRole.TEXTURES,
];

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
		case ContributorRole.ART:
			return "Art";
		case ContributorRole.TEXTURES:
			return "Textures";
		default:
			return "Unknown Role";
	}
};
