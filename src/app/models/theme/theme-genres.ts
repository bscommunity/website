import type { ThemeGenre } from "./beatstar-themes";
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

const GENRE_THEME_MAP: Record<ThemeGenre, { id: string; name: string }[]> = {
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
