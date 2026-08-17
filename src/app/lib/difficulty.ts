import { ChartModel } from "@/models/chart.model";
import { Difficulty } from "@/models/enums/difficulty.enum";

interface AverageDifficultyResult {
	label: string;
	difficulty?: Difficulty;
}

export function getAverageDifficulty(
	charts: ChartModel[],
): AverageDifficultyResult | null {
	if (charts.length === 0) return null;

	const totalScore = charts.reduce((sum, chart) => {
		const base = (() => {
			switch (chart.difficulty) {
				case Difficulty.HARD:
					return 2.0;
				case Difficulty.EXTREME:
					return 3.0;
				default:
					return 1.0;
			}
		})();
		return sum + base + (chart.isDeluxe ? 1.0 : 0.0);
	}, 0);

	const avg = totalScore / charts.length;

	let label: string;
	if (avg >= 4.0) {
		label = "Very Extreme";
	} else if (avg >= 3.5) {
		label = "Extreme";
	} else if (avg >= 3.0) {
		label = "Slightly Extreme";
	} else if (avg >= 2.5) {
		label = "Very Hard";
	} else if (avg >= 2.0) {
		label = "Hard";
	} else if (avg >= 1.5) {
		label = "Slightly Hard";
	} else {
		label = "Normal";
	}

	const hasHard = charts.some(
		(c) => c.difficulty === Difficulty.HARD || c.isDeluxe,
	);
	const hasExtreme = charts.some((c) => c.difficulty === Difficulty.EXTREME);

	return {
		label,
		difficulty: hasExtreme
			? Difficulty.EXTREME
			: hasHard
				? Difficulty.HARD
				: Difficulty.NORMAL,
	};
}
