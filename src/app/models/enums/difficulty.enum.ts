export enum Difficulty {
	NORMAL = "NORMAL",
	HARD = "HARD",
	EXTREME = "EXTREME",
}

export const getDifficultyLabel = (difficulty: Difficulty): string => {
	switch (difficulty) {
		case Difficulty.NORMAL:
			return "Normal";
		case Difficulty.HARD:
			return "Hard";
		case Difficulty.EXTREME:
			return "Extreme";
		default:
			return "Unknown Difficulty";
	}
};

export const getDifficultyIcon = (difficulty: Difficulty): string | null => {
	switch (difficulty) {
		case Difficulty.HARD:
			return "assets/difficulties/hard.png";
		case Difficulty.EXTREME:
			return "assets/difficulties/extreme.png";
		default:
			return null;
	}
};
