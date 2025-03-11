export interface OdesliEntity {
	id: string;
	type: string;
	title: string;
	artistName: string;
	thumbnailUrl: string;
	thumbnailWidth: number;
	thumbnailHeight: number;
	apiProvider: string;
	platforms: string[];
}

export interface OdesliLink {
	country: string;
	url: string;
	entityUniqueId: string;
	nativeAppUriMobile?: string;
	nativeAppUriDesktop?: string;
}

export interface OdesliResponse {
	entityUniqueId: string;
	userCountry: string;
	pageUrl: string;
	entitiesByUniqueId: Record<string, OdesliEntity>;
	linksByPlatform: Record<string, OdesliLink>;
}
