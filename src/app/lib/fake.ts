import type { ChartModel } from "@/models/chart.model";
import { CatalogItemStatus } from "@/models/enums/catalog-item-status.enum";
import { CatalogItemType } from "@/models/enums/catalog-item-type.enum";

import { Difficulty } from "@/models/enums/difficulty.enum";
import { Genre } from "@/models/enums/genre.enum";
import { ContributorRole } from "@/models/enums/role.enum";
import { Visibility } from "@/models/enums/visibility.enum";
import { TourPassModel } from "@/models/tour-pass.model";
import type { TrackModel } from "@/models/track.model";
import type { VersionModel } from "@/models/version.model";

const fakeTrack: TrackModel = {
	id: "track-1",
	title: "Words As Weapons",
	artist: "Seether",
	album: "Poison The Parish",
	isrc: null,
	genre: Genre.ROCK,
	bpm: 110,
	duration: 165.03409,
	streamingRefs: [],
	coverUrl:
		"https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/52/a7/2a52a747-8366-f822-356b-29006a9093f4/19CRGIM11684.rgb.jpg/600x600bb.jpg",
	previewUrl:
		"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/eb/dc/2e/ebdc2e0d-61c4-1318-3490-d916eb03a30f/mzaf_284666455123040979.plus.aac.p.m4a",
};

const fakeVersion: VersionModel = {
	id: "1411705646486786158",
	catalogItemId: "1411705646297907221",
	versionCode: 1,
	downloadsAmount: 3,
	fileSizeBytes: 1024000,
	changelog: null,
	createdAt: new Date("2025-08-31T00:00"),
	discordAttachmentId: null,
};

export const SAMPLE_CHART_1: ChartModel = {
	id: "1411705646297907221",
	type: CatalogItemType.CHART,
	status: CatalogItemStatus.PUBLISHED,
	visibility: Visibility.PUBLIC,
	isFeatured: false,
	downloadsSum: 1234,
	changelog: [],
	contributors: [
		{
			user: {
				id: "b27abf7e-6a1a-48f1-9b8f-02a96687a371",
				username: "zkyant",
				avatarUrl:
					"https://cdn.discordapp.com/avatars/598634405778554890/b2e144548221ef78c8300922c2c46447.png",
				bannerUrl: null,
				bio: null,
				accentColor: null,
				isVerified: true,
				followersCount: 10,
				followingCount: 5,
			},
			catalogItemId: "1411705646297907221",
			role: ContributorRole.AUDIO,
			joinedAt: new Date("2025-08-30T18:45:00"),
		},
	],
	createdAt: new Date("2025-08-30T18:45:00"),
	publishedAt: new Date("2025-09-01T12:00:00"),
	updatedAt: new Date("2025-09-03T18:45:00"),
	likedAt: new Date("2025-09-02T15:30:00"),
	bookmarkedAt: new Date("2025-09-01T12:00:00"),
	previewVideoId: null,
	discordChannelId: null,
	discordMessageId: null,
	authorId: null,

	track: fakeTrack,
	versionsCount: 1,
	difficulty: Difficulty.HARD,
	notesAmount: 556,
	effectsAmount: 0,
	isDeluxe: false,
	isExplicit: false,
	latestVersion: fakeVersion,
};

export const SAMPLE_TOURPASS_1: TourPassModel = {
	id: "1411705646297907221",
	type: CatalogItemType.TOUR_PASS,
	status: CatalogItemStatus.PUBLISHED,
	visibility: Visibility.PUBLIC,
	isFeatured: false,
	downloadsSum: 1234,
	contributors: [
		{
			user: {
				id: "b27abf7e-6a1a-48f1-9b8f-02a96687a371",
				username: "zkyant",
				avatarUrl:
					"https://cdn.discordapp.com/avatars/598634405778554890/b2e144548221ef78c8300922c2c46447.png",
				bannerUrl: null,
				bio: null,
				accentColor: null,
				isVerified: true,
				followersCount: 10,
				followingCount: 5,
			},
			catalogItemId: "1411705646297907221",
			role: ContributorRole.AUDIO,
			joinedAt: new Date("2025-08-30T18:45:00"),
		},
	],
	createdAt: new Date("2025-08-30T18:45:00"),
	publishedAt: new Date("2025-09-01T12:00:00"),
	updatedAt: new Date("2025-09-03T18:45:00"),
	likedAt: new Date("2025-09-02T15:30:00"),
	bookmarkedAt: new Date("2025-09-01T12:00:00"),
	likesCount: 42,
	bookmarksCount: 18,
	previewVideoId: null,
	discordChannelId: null,
	discordMessageId: null,
	authorId: null,

	name: "Sample Tourpass 1",
	description: "This is a sample tourpass for testing purposes.",
	artist: "Sample Artist",
	charts: [SAMPLE_CHART_1],
	coverUrl: null,
};
