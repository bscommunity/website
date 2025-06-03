import { Genre } from "@/models/enums/genre.enum";

export function normalizeGenre(genre: string | undefined): Genre | undefined {
	if (!genre) return undefined;

	const normalizedInput = genre.toLowerCase();

	// Tenta encontrar uma correspondência direta primeiro
	for (const [key, values] of Object.entries(genreMap)) {
		if (values.some((g) => normalizedInput.includes(g))) {
			return Genre[key as keyof typeof Genre];
		}
	}

	// Fallback baseado em características comuns da música
	if (DANCE_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
		return Genre.DANCE;
	}

	if (POP_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
		return Genre.POP;
	}

	if (HIP_HOP_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
		return Genre.HIP_HOP;
	}

	if (ROCK_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
		return Genre.ROCK;
	}

	if (RNB_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
		return Genre.RNB;
	}

	if (
		ALTERNATIVE_KEYWORDS.some((keyword) =>
			normalizedInput.includes(keyword),
		)
	) {
		return Genre.ALTERNATIVE;
	}

	if (
		CLASSICAL_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))
	) {
		return Genre.CLASSICAL;
	}

	// Se ainda não encontrou nada, retorna POP como último fallback
	return Genre.POP;
}

const genreMap: { [key: string]: string[] } = {
	HIP_HOP: [
		"hip hop",
		"rap",
		"trap",
		"urban",
		"crunk",
		"dirty south",
		"gangsta rap",
		"drill",
		"grime",
		"breakbeat",
		"beats",
		"boom bap",
		"rhyme",
	],
	POP: [
		"pop",
		"teen pop",
		"k-pop",
		"j-pop",
		"dance pop",
		"electropop",
		"europop",
		"synthpop",
		"power pop",
		"pop rock",
		"disco",
		"contemporary",
		"mainstream",
		"commercial",
	],
	RNB: [
		"r&b",
		"rnb",
		"soul",
		"funk",
		"motown",
		"neo soul",
		"jazz",
		"blues",
		"gospel",
		"smooth jazz",
		"rhythm and blues",
		"swing",
		"reggae",
		"ska",
		"tropical",
	],
	ROCK: [
		"rock",
		"metal",
		"punk",
		"grunge",
		"hard rock",
		"indie rock",
		"alternative rock",
		"progressive rock",
		"post-rock",
		"garage rock",
		"psychedelic",
		"rockabilly",
		"hardcore",
		"heavy",
		"death",
		"thrash",
	],
	DANCE: [
		"dance",
		"electronic",
		"edm",
		"house",
		"techno",
		"trance",
		"dubstep",
		"drum and bass",
		"breakcore",
		"jungle",
		"hardstyle",
		"garage",
		"ambient",
		"synthwave",
		"electronica",
		"bass music",
		"future bass",
		"bass",
		"glitch",
		"8bit",
		"chiptune",
	],
	ALTERNATIVE: [
		"alternative",
		"indie",
		"folk",
		"singer-songwriter",
		"experimental",
		"art rock",
		"post-punk",
		"new wave",
		"shoegaze",
		"dreampop",
		"lo-fi",
		"acoustic",
		"americana",
		"world",
		"fusion",
		"avant",
		"progressive",
	],
	CLASSICAL: [
		"classical",
		"orchestra",
		"symphony",
		"opera",
		"chamber music",
		"baroque",
		"contemporary classical",
		"instrumental",
		"soundtrack",
		"score",
		"ost",
		"film score",
		"neoclassical",
		"orchestral",
		"cinematic",
		"piano",
	],
};

const DANCE_KEYWORDS = ["mix", "club", "dj"];
const POP_KEYWORDS = ["vocal", "song", "hit", "idol"];
const HIP_HOP_KEYWORDS = ["beat", "rhythm", "rap", "flow"];
const ROCK_KEYWORDS = ["band", "guitar", "riff"];
const RNB_KEYWORDS = ["groove", "soul", "vibe"];
const ALTERNATIVE_KEYWORDS = ["experimental", "underground", "indie"];
const CLASSICAL_KEYWORDS = ["orchestra", "ensemble", "concerto"];
