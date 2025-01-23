import { Difficulty } from "@/models/enums/difficulty.enum";

export const difficultiesIcons: Partial<Record<Difficulty, string>> = {
	[Difficulty.Hard]: "assets/difficulties/hard.png",
	[Difficulty.Extreme]: "assets/difficulties/extreme.png",
};
