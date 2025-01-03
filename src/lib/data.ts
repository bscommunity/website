export enum Difficulty {
	Normal = "Normal",
	Hard = "Hard",
	Extreme = "Extreme",
}

export const difficultiesIcons: Partial<Record<Difficulty, string>> = {
	[Difficulty.Hard]: "assets/difficulties/hard.png",
	[Difficulty.Extreme]: "assets/difficulties/extreme.png",
};
