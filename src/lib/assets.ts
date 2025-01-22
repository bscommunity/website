import { environment } from "environments/environment";

const ITUNES_API_URL = "https://itunes.apple.com/search";
const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_API_KEY = environment.lastFmApiKey;

/**
 * Find album name using Last.fm API
 */
async function findAlbumFromTrack(
	track: string,
	artist: string,
): Promise<string> {
	const query = new URLSearchParams({
		method: "track.getInfo",
		artist: artist,
		track: track,
		api_key: LASTFM_API_KEY,
		format: "json",
	}).toString();

	console.log(query);

	const response = await fetch(`${LASTFM_API_URL}?${query}`);

	if (!response.ok) {
		throw new Error(`Last.fm API error: ${response.statusText}`);
	}

	const data = await response.json();

	if (!data.track?.album?.title) {
		throw new Error(`No album found for track "${track}" by "${artist}"`);
	}

	return data.track.album.title;
}

/**
 * Get album cover art URL using artist and album name
 * If album is not provided, attempts to find it using track name via Last.fm
 */
export async function getCoverArtUrl(
	artist: string,
	track?: string,
	album?: string | null,
): Promise<string> {
	try {
		// If album is not provided but track is, try to find the album
		if (!album?.trim() && track?.trim()) {
			console.warn(
				"Album not provided, attempting to search for it using track name.",
			);
			album = await findAlbumFromTrack(track, artist);
		}

		// If we still don't have an album name, we can't proceed
		if (!album?.trim()) {
			throw new Error(
				"Album name is required and could not be determined from track",
			);
		}

		// Search for the album cover
		const query = `term=${encodeURIComponent(artist + " " + album)}&entity=album&limit=1`;
		const response = await fetch(`${ITUNES_API_URL}?${query}`);

		if (!response.ok) {
			throw new Error(`iTunes API error: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.results || data.results.length === 0) {
			throw new Error(`No cover art found for "${album}" by "${artist}"`);
		}

		// Get higher resolution version of the artwork
		return data.results[0].artworkUrl100.replace("100x100", "600x600");
	} catch (error) {
		// Wrap all errors in a consistent format
		throw new Error(
			`Failed to get cover art: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
