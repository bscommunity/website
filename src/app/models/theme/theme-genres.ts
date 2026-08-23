import type { BeatstarTheme, ThemeGenre } from "./beatstar-themes";
import {
	rock,
	pop,
	alternative,
	hipHop,
	universal,
	rnb,
	dance,
	country,
} from "./beatstar-themes-data";

export const THEME_GENRE_LABELS: Record<ThemeGenre, string> = {
	rock: "Rock",
	pop: "Pop",
	alternative: "Alternative",
	hipHop: "Hip-Hop",
	universal: "Universal",
	rnb: "R&B",
	dance: "Dance",
	country: "Country",
};

export const THEME_GENRES: ThemeGenre[] = [
	"rock",
	"pop",
	"alternative",
	"hipHop",
	"universal",
	"rnb",
	"dance",
	"country",
];

const GENRE_THEME_MAP: Record<ThemeGenre, BeatstarTheme[]> = {
	rock,
	pop,
	alternative,
	hipHop,
	universal,
	rnb,
	dance,
	country,
};

export function getThemesByGenre(genre: ThemeGenre): { id: string; name: string }[] {
	return GENRE_THEME_MAP[genre] ?? [];
}

function normalizeThemeKey(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const THEME_NAME_BY_KEY = new Map<string, string>();
const THEME_BY_KEY = new Map<string, BeatstarTheme>();

for (const theme of Object.values(GENRE_THEME_MAP).flat()) {
	for (const key of [theme.id, theme.name, theme.sourceName]) {
		if (!key) continue;
		const normalized = normalizeThemeKey(key);
		if (normalized && !THEME_NAME_BY_KEY.has(normalized)) {
			THEME_NAME_BY_KEY.set(normalized, theme.name);
		}
		if (normalized && !THEME_BY_KEY.has(normalized)) {
			THEME_BY_KEY.set(normalized, theme);
		}
	}
}

export function getBeatstarThemeName(id: string): string | undefined {
	const normalized = normalizeThemeKey(id);
	return normalized ? THEME_NAME_BY_KEY.get(normalized) : undefined;
}

export function getBeatstarTheme(id: string): BeatstarTheme | undefined {
	const normalized = normalizeThemeKey(id);
	return normalized ? THEME_BY_KEY.get(normalized) : undefined;
}
