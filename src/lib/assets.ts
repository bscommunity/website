import { environment } from "environments/environment";

const LASTFM_API_KEY = environment.LASTFM_API_KEY;
const SPOTIFY_API_KEY = environment.SPOTIFY_API_KEY;

// Types
import type { ITunesResponse } from "types/ITunesResponse";
import type { LastFMResponse } from "types/LastFmResponse";
import type { OdesliResponse } from "types/OdesliResponse";

const ITUNES_API_URL = "https://itunes.apple.com/search";
const ODESLI_API_URL = "https://api.song.link/v1-alpha.1";
const LASTFM_API_URL = "http://ws.audioscrobbler.com/2.0/";
const MUSICBRAINZ_API_URL = "https://musicbrainz.org/ws/2/recording";

// Models
import { z } from "zod";
import { CreateChart } from "@/models/chart.model";
import { Genre } from "@/models/enums/genre.enum";
import { StreamingLinkModel } from "@/models/streaming-link.model";
import {
	StreamingPlatform,
	StreamingPlatformUtils,
} from "@/models/enums/streaming-platform.model";

// Lib
import { normalizeGenre } from "./genres";

// Services & Injections
import { CookieService } from "@/services/cookie.service";
import { importKey, encrypt, decrypt } from "@/lib/security";

const MediaInfo = CreateChart.pick({
	coverUrl: true,
	album: true,
	track: true,
	genre: true,
	artist: true,
	trackUrls: true,
	trackPreviewUrl: true,
});

export type MediaInfoModel = z.infer<typeof MediaInfo>;

function cleanTrackName(track: string): string {
	return track
		.replace(/\(.*?\)/g, "") // Remove content in parentheses
		.replace(/\[.*?\]/g, "") // Remove content in brackets
		.replace(/feat\.|ft\.|featuring/i, "") // Remove featuring
		.replace(/remix|edit|version|remaster(ed)?/i, "") // Remove version indicators
		.replace(/part\.?\s*\d+/i, "") // Remove "part X"
		.replace(/\s+/g, " ") // Remove extra spaces
		.trim();
}

function cleanArtistName(artist: string): string {
	return artist
		.replace(/feat\.|ft\.|featuring/i, "") // Remove featuring
		.replace(/&amp;/g, "&") // Fix ampersands
		.replace(/\s*,\s*/g, " & ") // Replace commas with &
		.replace(/\s+/g, " ") // Remove extra spaces
		.trim();
}

/**
 * Smart track matching algorithm to find the best match from search results
 */
function findBestTrackMatch(
	tracks: ITunesResponse[],
	targetTrack: string,
	targetArtist: string,
): ITunesResponse | null {
	if (!tracks || tracks.length === 0) return null;

	const scoredTracks = tracks.map((track) => ({
		track,
		score: calculateTrackScore(track, targetTrack, targetArtist),
	}));

	// Sort by score (highest first)
	scoredTracks.sort((a, b) => b.score - a.score);

	// Return the highest scored track
	return scoredTracks[0].track;
}

/**
 * Calculate a score for how well a track matches the search criteria
 */
function calculateTrackScore(
	track: ITunesResponse,
	targetTrack: string,
	targetArtist: string,
): number {
	let score = 0;

	const trackName = track.trackName.toLowerCase();
	const artistName = track.artistName.toLowerCase();
	const collectionName = track.collectionName.toLowerCase();

	const normalizedTargetTrack = targetTrack.toLowerCase();
	const normalizedTargetArtist = targetArtist.toLowerCase();

	// Exact track name match gets highest score
	if (trackName === normalizedTargetTrack) {
		score += 100;
	} else if (trackName.includes(normalizedTargetTrack)) {
		score += 70;
	} else if (normalizedTargetTrack.includes(trackName)) {
		score += 50;
	}

	// Exact artist match
	if (artistName === normalizedTargetArtist) {
		score += 80;
	} else if (
		artistName.includes(normalizedTargetArtist) ||
		normalizedTargetArtist.includes(artistName)
	) {
		score += 60;
	}

	// Penalize remixes, edits, versions, etc.
	const remixPatterns =
		/\b(remix|edit|version|remaster|acoustic|live|instrumental|radio|extended|club|dub|vip)\b/i;
	if (remixPatterns.test(trackName)) {
		score -= 30;
	}

	// Bonus for single releases (more likely to be original)
	if (collectionName.includes("single") || track.trackCount === 1) {
		score += 20;
	}

	// Bonus for tracks from main albums vs remix albums
	if (!collectionName.includes("remix") && !collectionName.includes("edit")) {
		score += 15;
	}

	// Prefer newer releases (but not too heavily)
	const releaseYear = new Date(track.releaseDate).getFullYear();
	const currentYear = new Date().getFullYear();
	if (releaseYear >= currentYear - 2) {
		score += 5;
	}

	return score;
}

/**
 * Find media information (album cover, etc.) using track and artist names
 */
export async function getMediaInfo(
	track: string,
	artist: string,
	cookieService: CookieService,
): Promise<MediaInfoModel> {
	// Clean track and artist names for better search results
	const cleanedTrack = cleanTrackName(track);
	const cleanedArtist = cleanArtistName(artist);

	let errors: Error[] = [];
	let foundGenre: Genre | undefined = undefined;
	// Try iTunes first with smart result selection
	try {
		let query = new URLSearchParams({
			term: `${cleanedTrack} ${cleanedArtist}`,
			entity: "song",
			limit: "5", // Get more results to find the best match
		}).toString();

		const iTunesResults = await fetchItunesApi(query);

		if (iTunesResults && iTunesResults.length > 0) {
			// Find the best match using smart scoring
			const bestMatch = findBestTrackMatch(
				iTunesResults,
				cleanedTrack,
				cleanedArtist,
			);

			if (bestMatch) {
				foundGenre = normalizeGenre(bestMatch.primaryGenreName);
				return {
					coverUrl: bestMatch.artworkUrl100.replace(
						"100x100",
						"600x600",
					),
					album: bestMatch.collectionName,
					track: bestMatch.trackName,
					artist: bestMatch.artistName,
					genre: foundGenre,
					trackUrls: [
						{
							platform: StreamingPlatform.APPLE_MUSIC,
							url: bestMatch.trackViewUrl,
						},
					],
					trackPreviewUrl: bestMatch.previewUrl,
				};
			}
		}
	} catch (err) {
		errors.push(err as Error);
	}

	// Try Spotify next
	try {
		const spotifyData = await fetchSpotifyApi(
			`q=${cleanedTrack} artist:${cleanedArtist}&type=track,album&limit=1`,
			cookieService,
		);

		if (spotifyData && spotifyData.tracks.items.length > 0) {
			const spotifyTrack = spotifyData.tracks.items[0];

			// Try to get the genre from the album
			const albumGenre = spotifyData.albums?.items[0]?.genres?.[0];
			foundGenre = normalizeGenre(albumGenre) || foundGenre;

			return {
				coverUrl: spotifyTrack.album.images[0].url,
				album: spotifyTrack.album.name,
				track: spotifyTrack.name,
				artist: spotifyTrack.artists[0].name,
				genre: foundGenre,
				trackUrls: [
					{
						platform: StreamingPlatform.SPOTIFY,
						url: spotifyTrack.external_urls.spotify,
					},
				],
			};
		}
	} catch (err) {
		errors.push(err as Error);
	}

	// Try Last.fm as last resort
	try {
		const query = new URLSearchParams({
			method: "track.getInfo",
			artist: cleanedArtist,
			track: cleanedTrack,
			api_key: LASTFM_API_KEY,
			format: "json",
		}).toString();

		const lastFmData = await fetchLastfmApi(query);

		if (lastFmData && lastFmData.track.album) {
			// Try to get the genre from the tags
			const tags = lastFmData.track.toptags?.tag || [];
			for (const tag of tags) {
				const genreFromTag = normalizeGenre(tag.name);
				if (genreFromTag) {
					foundGenre = genreFromTag;
					break;
				}
			}

			return {
				coverUrl: lastFmData.track.album.image[3]["#text"],
				album: lastFmData.track.album.title,
				track: lastFmData.track.name,
				artist: lastFmData.track.artist.name,
				genre: foundGenre,
				trackUrls: [
					{
						platform: StreamingPlatform.LAST_FM,
						url: lastFmData.track.url,
					},
				],
			};
		}
	} catch (err) {
		errors.push(err as Error);
	}
	// If we reach here, we try one last time with a more flexible search on iTunes
	try {
		const veryCleanTrack = cleanedTrack.split("-")[0].trim();
		const query = new URLSearchParams({
			term: `${veryCleanTrack} ${cleanedArtist.split("&")[0].trim()}`,
			entity: "song",
			limit: "5",
		}).toString();

		const iTunesResults = await fetchItunesApi(query);

		if (iTunesResults && iTunesResults.length > 0) {
			const bestMatch = findBestTrackMatch(
				iTunesResults,
				veryCleanTrack,
				cleanedArtist.split("&")[0].trim(),
			);

			if (bestMatch) {
				foundGenre =
					normalizeGenre(bestMatch.primaryGenreName) || foundGenre;
				return {
					coverUrl: bestMatch.artworkUrl100.replace(
						"100x100",
						"600x600",
					),
					album: bestMatch.collectionName,
					track: bestMatch.trackName,
					artist: bestMatch.artistName,
					genre: foundGenre,
					trackUrls: [
						{
							platform: StreamingPlatform.APPLE_MUSIC,
							url: bestMatch.trackViewUrl,
						},
					],
					trackPreviewUrl: bestMatch.previewUrl,
				};
			}
		}
	} catch (err) {
		errors.push(err as Error);
	}

	// If all attempts failed, throw an error with all the collected error messages
	throw new Error(
		`Unable to find information for \"${track}\" by \"${artist}\". ` +
			`We tried several APIs but all failed. Details: ${errors.map((e) => e.message).join("; ")}`,
	);
}

export async function getTrackStreamingLinks(
	url: string,
	track: string,
	artist: string,
): Promise<StreamingLinkModel[]> {
	const query = new URLSearchParams({
		url: url,
	}).toString();

	// First, try to search for the links with Odesli
	// Odesli returns keys like "youtubeMusic", "youtube", "appleMusic", "itunes", "amazonMusic", "amazonStore"
	const odesliData = await fetchOdesliApi(query);
	console.log("Odesli data", odesliData);

	if (odesliData) {
		const odesliLinks = Object.entries(odesliData.linksByPlatform).map(
			([key, value]) => ({
				key,
				url: value.url,
			}),
		);

		return StreamingPlatformUtils.processLinksWithPrioritization(
			odesliLinks,
			true,
		);
	}

	// Fallback to MusicBrainz
	// MusicBrainz returns direct URLs like "https://music.youtube.com/...", "https://youtube.com/..."
	let musicBrainzData = await fetchMusicBrainzApi(
		"",
		`recording:"${track}" AND artist:"${artist}"`,
	);

	if (musicBrainzData) {
		const trackId = musicBrainzData.recordings[0].id;
		musicBrainzData = await fetchMusicBrainzApi(
			`/${trackId}`,
			`inc=url-rels`,
		);

		if (musicBrainzData) {
			const relations = musicBrainzData.relations;
			console.log("MusicBrainz data", musicBrainzData);

			const musicBrainzLinks = relations
				.filter((relation: any) => relation.type === "free streaming")
				.map((relation: any) => ({
					key: relation.url.resource,
					url: relation.url.resource,
				}));

			return StreamingPlatformUtils.processLinksWithPrioritization(
				musicBrainzLinks,
				false,
			);
		}
	}

	throw new Error("No streaming links found for track");
}

async function fetchItunesApi(query: string): Promise<ITunesResponse[]> {
	const response = await fetch(`${ITUNES_API_URL}?${query}`);

	if (!response.ok) {
		throw new Error(`iTunes API error: ${response.statusText}`);
	}

	const data = await response.json();
	return data.results || [];
}

async function fetchOdesliApi(query: string): Promise<OdesliResponse> {
	const response = await fetch(`${ODESLI_API_URL}/links?${query}`);

	if (!response.ok) {
		throw new Error(`Odesli API error: ${response.statusText}`);
	}

	return response.json();
}

async function fetchLastfmApi(query: string): Promise<LastFMResponse> {
	const response = await fetch(`${LASTFM_API_URL}?${query}`);

	if (!response.ok) {
		throw new Error(`Last.fm API error: ${response.statusText}`);
	}

	const data = await response.json();

	if (data.message) {
		throw new Error(data.message);
	}

	return data;
}

async function fetchMusicBrainzApi(url: string, query: string): Promise<any> {
	const response = await fetch(
		`${MUSICBRAINZ_API_URL}${url}?${query}&fmt=json`,
	);

	if (!response.ok) {
		throw new Error(`MusicBrainz API error: ${response.statusText}`);
	}

	return response.json();
}

async function fetchSpotifyApi(
	query: string,
	cookieService: CookieService,
): Promise<any> {
	const token = await getSpotifyToken(cookieService);
	const response = await fetch(`https://api.spotify.com/v1/search?${query}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Spotify API error: ${response.statusText}`);
	}

	return response.json();
}

async function getSpotifyToken(cookieService: CookieService) {
	let token = null;
	const encryptedToken = cookieService.get("spotify_token");

	if (encryptedToken) {
		const key = await importKey(SPOTIFY_API_KEY);
		const decrypted_token = await decrypt(JSON.parse(encryptedToken), key);

		token = decrypted_token;
		console.log("Using cached Spotify token");
	}

	if (!token) {
		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${btoa(
					`${environment.SPOTIFY_CLIENT_ID}:${environment.SPOTIFY_API_KEY}`,
				)}`,
			},
			body: new URLSearchParams({
				grant_type: "client_credentials",
			}),
		});

		if (!response.ok) {
			throw new Error(`Spotify API error: ${response.statusText}`);
		}

		const data = await response.json();

		cookieService.set("spotify_token", data.access_token, {
			expires: new Date(Date.now() + data.expires_in * 1000),
		});

		token = data.access_token;
	}

	const key = await importKey(environment.SPOTIFY_API_KEY);
	const encryptedObject = await encrypt(token, key);

	cookieService.set("spotify_token", JSON.stringify(encryptedObject), {
		expires: new Date(Date.now() + 3600 * 1000),
	});

	return token;
}
