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
import { Chart } from "@/models/chart.model";
import { StreamingLinkModel } from "@/models/streaming-link.model";

// Services & Injections
import { CookieService } from "@/services/cookie.service";
import { importKey, encrypt, decrypt } from "@/lib/security";

const MediaInfo = Chart.pick({
	coverUrl: true,
	album: true,
	track: true,
	artist: true,
	trackUrls: true,
	trackPreviewUrl: true,
});

export type MediaInfoModel = z.infer<typeof MediaInfo>;

/**
 * Find media information (album cover, etc.) using track and artist names
 */
export async function getMediaInfo(
	track: string,
	artist: string,
	cookieService: CookieService,
): Promise<MediaInfoModel> {
	// Construct the search query
	let query = new URLSearchParams({
		term: `${track} ${artist}`,
		entity: "song",
		limit: "1",
	}).toString();

	// First, search for the track on iTunes
	let iTunesData = await fetchItunesApi(query);

	// Check if results are available
	if (iTunesData) {
		console.log(iTunesData);

		return {
			coverUrl: iTunesData.artworkUrl100.replace("100x100", "600x600"),
			album: iTunesData.collectionName,
			track: iTunesData.trackName,
			artist: iTunesData.artistName,
			trackUrls: [
				{
					platform: "Apple Music",
					url: iTunesData.trackViewUrl,
				},
			],
			trackPreviewUrl: iTunesData.previewUrl,
		};
	}

	// If no results were found on iTunes, try Last.fm
	query = new URLSearchParams({
		method: "track.getInfo",
		artist: artist,
		track: track,
		api_key: LASTFM_API_KEY,
		format: "json",
	}).toString();

	const spotifyData = await fetchSpotifyApi(
		`q=${track} artist:${artist}&type=track&limit=1`,
		cookieService,
	);

	if (spotifyData && spotifyData.tracks.items.length > 0) {
		console.log(spotifyData);
		const spotifyTrack = spotifyData.tracks.items[0];

		return {
			coverUrl: spotifyTrack.album.images[0].url,
			album: spotifyTrack.album.name,
			track: spotifyTrack.name,
			artist: spotifyTrack.artists[0].name,
			trackUrls: [
				{
					platform: "Spotify",
					url: spotifyTrack.external_urls.spotify,
				},
			],
		};
	}

	const lastFmData = await fetchLastfmApi(query);

	// Check if results are available
	if (lastFmData) {
		console.log(lastFmData);
		// Return higher resolution version of the artwork
		return {
			coverUrl: lastFmData.track.album.image[3]["#text"],
			album: lastFmData.track.album.title,
			track: lastFmData.track.name,
			artist: lastFmData.track.artist.name,
			trackUrls: [
				{
					platform: "Last.fm",
					url: lastFmData.track.url,
				},
			],
		};
	}

	// If no results were found on iTunes or Last.fm, throw error
	throw new Error(
		`No results found for track "${track}" by artist "${artist}"`,
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
	const odesliData = await fetchOdesliApi(query);

	if (odesliData) {
		let links: StreamingLinkModel[] = [];

		for (const [key, value] of Object.entries(odesliData.linksByPlatform)) {
			links.push({
				platform: key,
				url: value.url,
			});
		}

		return links;
	}

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

			for (const relation of relations) {
				if (relation.type === "free streaming") {
					const url = relation.url.resource;
					return [
						{
							platform: getPlatformFromLink(url),
							url: url,
						},
					];
				}
			}
		}
	}

	throw new Error("No streaming links found for track");
}

function getPlatformFromLink(link: string): string {
	switch (true) {
		case link.includes("spotify"):
			return "Spotify";
		case link.includes("youtube"):
			return "YouTube";
		case link.includes("soundcloud"):
			return "SoundCloud";
		case link.includes("deezer"):
			return "Deezer";
		case link.includes("apple"):
			return "Apple Music";
		case link.includes("amazon"):
			return "Amazon Music";
		default:
			return "Unknown";
	}
}

async function fetchItunesApi(query: string): Promise<ITunesResponse> {
	const response = await fetch(`${ITUNES_API_URL}?${query}`);

	if (!response.ok) {
		throw new Error(`iTunes API error: ${response.statusText}`);
	}

	const data = await response.json();
	return data.results[0];
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
