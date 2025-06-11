export enum StreamingPlatform {
	SPOTIFY = "SPOTIFY",
	APPLE_MUSIC = "APPLE_MUSIC",
	YOUTUBE_MUSIC = "YOUTUBE_MUSIC",
	DEEZER = "DEEZER",
	TIDAL = "TIDAL",
	AMAZON_MUSIC = "AMAZON_MUSIC",
	SOUNDCLOUD = "SOUNDCLOUD",
	LAST_FM = "LAST_FM",
}

/**
 * Utility class for handling streaming platform detection and prioritization
 */
export class StreamingPlatformUtils {
	/**
	 * Platform group definitions for prioritization
	 */
	private static readonly PLATFORM_GROUPS = [
		{
			keywords: ["youtu"],
			group: "youtube",
			platform: StreamingPlatform.YOUTUBE_MUSIC,
		},
		{
			keywords: ["apple", "itunes"],
			group: "apple",
			platform: StreamingPlatform.APPLE_MUSIC,
		},
		{
			keywords: ["amazon"],
			group: "amazon",
			platform: StreamingPlatform.AMAZON_MUSIC,
		},
		{
			keywords: ["spotify"],
			group: "spotify",
			platform: StreamingPlatform.SPOTIFY,
		},
		{
			keywords: ["deezer"],
			group: "deezer",
			platform: StreamingPlatform.DEEZER,
		},
		{
			keywords: ["tidal"],
			group: "tidal",
			platform: StreamingPlatform.TIDAL,
		},
		{
			keywords: ["soundcloud"],
			group: "soundcloud",
			platform: StreamingPlatform.SOUNDCLOUD,
		},
		{
			keywords: ["last"],
			group: "lastfm",
			platform: StreamingPlatform.LAST_FM,
		},
	];

	/**
	 * Detects the platform from a key or URL string
	 */
	static detectPlatform(keyOrUrl: string): StreamingPlatform | null {
		const normalized = keyOrUrl.toLowerCase();

		for (const group of this.PLATFORM_GROUPS) {
			if (
				group.keywords.some((keyword) => normalized.includes(keyword))
			) {
				return group.platform;
			}
		}

		return null;
	}

	/**
	 * Gets the platform group identifier for prioritization
	 */
	static getPlatformGroup(keyOrUrl: string): string | null {
		const normalized = keyOrUrl.toLowerCase();

		for (const group of this.PLATFORM_GROUPS) {
			if (
				group.keywords.some((keyword) => normalized.includes(keyword))
			) {
				return group.group;
			}
		}

		return null;
	}

	/**
	 * Checks if a key or URL represents a "music" version of a platform
	 */
	static isMusicVersion(keyOrUrl: string): boolean {
		return keyOrUrl.toLowerCase().includes("music");
	}

	/**
	 * Processes and prioritizes streaming links
	 * Prioritizes "music" versions within the same platform group
	 */
	static processLinksWithPrioritization(
		links: Array<{ key: string; url: string }>,
		useKeyForDetection: boolean = false,
	): Array<{ platform: StreamingPlatform; url: string }> {
		const linkMap = new Map<
			string,
			{
				key: string;
				url: string;
				platform: StreamingPlatform;
				isMusicVersion: boolean;
			}
		>();

		// Process all links
		for (const { key, url } of links) {
			// Use key for Odesli, URL for others
			const searchString = useKeyForDetection ? key : url;
			const platform = this.detectPlatform(searchString);
			const groupKey = this.getPlatformGroup(searchString);

			if (!platform || !url || !groupKey) {
				console.warn(
					`Skipping unknown platform or missing data: ${key}`,
				);
				continue;
			}

			const isMusicVersion = this.isMusicVersion(searchString);
			const existing = linkMap.get(groupKey);

			if (!existing) {
				// First link for this group
				linkMap.set(groupKey, { key, url, platform, isMusicVersion });
			} else {
				// Replace if current is music version and existing is not
				if (isMusicVersion && !existing.isMusicVersion) {
					linkMap.set(groupKey, {
						key,
						url,
						platform,
						isMusicVersion,
					});
				}
			}
		}

		// Convert to final format and log
		return Array.from(linkMap.values()).map(({ url, platform }) => {
			console.log(`Found link for platform: ${platform}, URL: ${url}`);
			return { platform, url };
		});
	}
}

/**
 * @deprecated Use StreamingPlatformUtils.detectPlatform() instead
 */
export function getPlatformFromLink(link: string): StreamingPlatform | null {
	return StreamingPlatformUtils.detectPlatform(link);
}
