const ITUNES_API_URL = "https://itunes.apple.com/search";

interface MediaInfo {
	coverUrl: string;
	album?: string;
	track?: string;
	artist?: string;
}

/**
 * Find media information (album cover, etc.) using track and artist names
 */
export async function getMediaInfo(
	track: string,
	artist: string,
): Promise<MediaInfo> {
	// Construct the search query
	const query = new URLSearchParams({
		term: `${track} ${artist}`,
		entity: "song",
		limit: "1",
	}).toString();

	// Fetch data from iTunes Search API
	const response = await fetch(`https://itunes.apple.com/search?${query}`);

	console.log("response", response);

	if (!response.ok) {
		throw new Error(`iTunes API error: ${response.statusText}`);
	}

	const data = await response.json();

	// Check if results are available
	if (!data.results || data.results.length === 0) {
		throw new Error(
			`No results found for track "${track}" by artist "${artist}"`,
		);
	}

	// Extract the artwork URL
	const artworkUrl100 = data.results[0].artworkUrl100;

	// Return higher resolution version of the artwork
	return {
		coverUrl: artworkUrl100.replace("100x100", "600x600"),
		album: data.results[0].collectionName,
		track: data.results[0].trackName,
		artist: data.results[0].artistName,
	};
}

/**
 * Get album cover art URL using artist and album name
 * If album is not provided, attempts to find it using track name via Last.fm
 */
/* async function getCoverArtUrl(
	artist: string,
	track?: string,
	album?: string | null,
): Promise<MediaInfo> {
	try {
		// If album is not provided but track is, try to find the album
		if (!album?.trim() && track?.trim()) {
			console.warn(
				"Album not provided, attempting to search for it using track name.",
			);
			return await getMediaInfo(track, artist);
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
		return {
			coverUrl: data.results[0].artworkUrl100.replace(
				"100x100",
				"600x600",
			),
		};
	} catch (error) {
		// Wrap all errors in a consistent format
		throw new Error(
			`Failed to get cover art: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
 */
