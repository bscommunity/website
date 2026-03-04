// Models
import { ChartModel } from "@/models/chart.model";

// Enums
import { Difficulty } from "@/models/enums/difficulty.enum";
import { Genre } from "@/models/enums/genre.enum";
import { ContributorRole } from "@/models/enums/role.enum";

export const SAMPLE_CHART_1: ChartModel = {
	artist: "Seether",
	track: "Words As Weapons",
	genre: Genre.ROCK,
	trackPreviewUrl:
		"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/eb/dc/2e/ebdc2e0d-61c4-1318-3490-d916eb03a30f/mzaf_284666455123040979.plus.aac.p.m4a",
	downloadsSum: 1234,
	bookmarkedAt: new Date("2025-09-01T12:00:00"),
	likedAt: new Date("2025-09-02T15:30:00"),
	createdAt: new Date("2025-08-30T18:45:00"),
	trackUrls: [],
	album: "Poison The Parish",
	updatedAt: new Date("2025-09-03T18:45:00"),
	versions: [
		{
			id: "1411705646486786158",
			chartId: "1411705646297907221",
			index: 1,
			duration: 165.03409,
			notesAmount: 556,
			effectsAmount: 0,
			bpm: 110,
			difficulty: Difficulty.HARD,
			createdAt: new Date("2025-08-31T00:00"),
			isDeluxe: false,
			isExplicit: false,
			bundleUrl:
				"https://cdn.discordapp.com/attachments/1404808964163768361/1411705646486786158/words_as_weapons_v1.zip?ex=693d6b56&is=693c19d6&hm=08afe124f68d584c0f30a69e018d8936b110b38d81d8c26dfdab73c68db732d7&",
			previewUrl: "",
			downloadsAmount: 3,
			changelog: [],
		},
	],
	latestVersion: {
		id: "1411705646486786158",
		chartId: "1411705646297907221",
		index: 1,
		duration: 165.03409,
		notesAmount: 556,
		effectsAmount: 0,
		bpm: 110,
		difficulty: Difficulty.HARD,
		createdAt: new Date("2025-08-31T00:00"),
		isDeluxe: false,
		isExplicit: false,
		bundleUrl:
			"https://cdn.discordapp.com/attachments/1404808964163768361/1411705646486786158/words_as_weapons_v1.zip?ex=693d6b56&is=693c19d6&hm=08afe124f68d584c0f30a69e018d8936b110b38d81d8c26dfdab73c68db732d7&",
		previewUrl: "",
		downloadsAmount: 3,
		changelog: [],
	},
	contributors: [
		{
			user: {
				id: "b27abf7e-6a1a-48f1-9b8f-02a96687a371",
				username: "zkyant",
				isPublic: true,
				followersCount: 10,
				followingCount: 5,
				avatarUrl:
					"https://cdn.discordapp.com/avatars/598634405778554890/b2e144548221ef78c8300922c2c46447.png",
			},
			roles: [ContributorRole.AUDIO],
			joinedAt: new Date("2025-08-30T18:45:00"),
		},
	],
	id: "1411705646297907221",
	contentId: "z6OjLt6BJI",
	coverUrl:
		"https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/52/a7/2a52a747-8366-f822-356b-29006a9093f4/19CRGIM11684.rgb.jpg/600x600bb.jpg",
	isPublic: true,
	isFeatured: false,
};
