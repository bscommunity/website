export enum Genre {
	HIP_HOP = "HIP_HOP",
	POP = "POP",
	RNB = "RNB",
	ROCK = "ROCK",
	DANCE = "DANCE",
	ALTERNATIVE = "ALTERNATIVE",
	CLASSICAL = "CLASSICAL",
}

export const getGenreLabel = (genre: Genre): string => {
	switch (genre) {
		case Genre.HIP_HOP:
			return "Hip-Hop";
		case Genre.POP:
			return "Pop";
		case Genre.RNB:
			return "R&B";
		case Genre.ROCK:
			return "Rock";
		case Genre.DANCE:
			return "Dance";
		case Genre.ALTERNATIVE:
			return "Alternative";
		case Genre.CLASSICAL:
			return "Classical";
		default:
			return genre;
	}
};

/* export const getGenreFromLabel = (label: string): Genre | null => {
	switch (label.toLowerCase()) {
		case "hip-hop":
			return Genre.HIP_HOP;
		case "pop":
			return Genre.POP;
		case "r&b":
			return Genre.RNB;
		case "rock":
			return Genre.ROCK;
		case "dance":
			return Genre.DANCE;
		case "alternative":
			return Genre.ALTERNATIVE;
		case "classical":
			return Genre.CLASSICAL;
		default:
			return null;
	}
}; */
