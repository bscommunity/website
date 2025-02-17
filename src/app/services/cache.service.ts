import { Injectable } from "@angular/core";

// Services
import { CookieService } from "./cookie.service";

// Models
import { ChartModel } from "@/models/chart.model";
import { ContributorModel } from "@/models/contributor.model";

const MAX_CACHED_CHARTS = 5;

interface CachedFullChart extends ChartModel {
	lastAccessed: string;
}

@Injectable({
	providedIn: "root",
})
export class CacheService {
	constructor(private cookieService: CookieService) {}

	private getChartCount(): number {
		return parseInt(this.cookieService.get("chartCount") || "0");
	}

	private increaseChartCount(): void {
		this.cookieService.set(
			"chartCount",
			(this.getChartCount() + 1).toString(),
			{ path: "/" },
		);
	}

	private decreaseChartCount(): void {
		this.cookieService.set(
			"chartCount",
			(this.getChartCount() - 1).toString(),
			{ path: "/" },
		);
	}

	/**
	 * Retrieves all charts stored in the browser's cookies.
	 *
	 * @param {boolean} full - If true, returns the full chart objects; otherwise, returns the simplified versions.
	 *
	 * @returns {ChartModel[] | undefined} An array of ChartModel objects if the "charts" cookie is found; otherwise, undefined.
	 */
	getAllCharts(full?: boolean): ChartModel[] | undefined {
		if (full) {
			const allCookies = this.cookieService.getAll();
			const fullCharts = Object.keys(allCookies)
				.filter((key) => key.startsWith("chart_"))
				.map((key) => JSON.parse(allCookies[key]));

			return fullCharts;
		} else {
			const charts = this.cookieService.get("charts");
			return charts ? JSON.parse(charts) : undefined;
		}
	}

	setAllCharts(charts: ChartModel[]): void {
		this.cookieService.set("charts", JSON.stringify(charts));
	}

	getChart(id: string): ChartModel | undefined {
		const chart = this.cookieService.get(`chart_${id}`);

		return chart ? JSON.parse(chart) : undefined;
	}

	addChart(chart: ChartModel): void {
		// If we have reached the maximum number of cached charts, we need to remove the oldest one
		if (this.getChartCount() >= MAX_CACHED_CHARTS) {
			const allCharts = this.getAllCharts(true) as CachedFullChart[];

			if (!allCharts || allCharts.length === 0) {
				return;
			}

			const oldestChart = allCharts.reduce((oldest, current) => {
				const oldestDate = new Date(oldest.lastAccessed);
				const currentDate = new Date(current.lastAccessed);

				return oldestDate < currentDate ? oldest : current;
			});

			this.removeChart(oldestChart.id);
		}

		// We add the new chart to the cache
		const cacheKey = `chart_${chart.id}`;
		this.cookieService.set(
			cacheKey,
			JSON.stringify({
				...chart,
				lastAccessed: new Date().toISOString(),
			}),
		);
		this.increaseChartCount();
	}

	removeChart(id: string): void {
		const cacheKey = `chart_${id}`;

		// If the chart exists, we remove it from the cache
		if (this.getChart(cacheKey)) {
			this.cookieService.delete(cacheKey);
			this.decreaseChartCount();
		}
	}

	updateChart(updatedChart: ChartModel): void {
		const chart = this.getChart(updatedChart.id);

		if (!chart) {
			return;
		}

		this.cookieService.set(
			`chart_${updatedChart.id}`,
			JSON.stringify(updatedChart),
		);
	}

	updateChartContributors(
		id: string,
		contributors: ContributorModel[],
	): void {
		const chart = this.getChart(id);

		if (!chart) {
			return;
		}

		const { contributors: oldContributors, ...rest } = chart;

		this.cookieService.set(
			`chart_${id}`,
			JSON.stringify({
				...rest,
				contributors: [oldContributors, ...contributors],
			}),
		);
	}

	updateChartContributor(
		id: string,
		updatedContributor: ContributorModel,
	): void {
		const chart = this.getChart(id);

		if (!chart || !chart.contributors) {
			return;
		}

		const updatedContributors = chart.contributors?.map((contributor) =>
			contributor.user.id === updatedContributor.user.id
				? updatedContributor
				: contributor,
		);

		this.cookieService.set(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				contributors: updatedContributors,
			}),
		);
	}

	deleteChartContributor(id: string, contributorId: string): void {
		const chart = this.getChart(id);

		if (!chart || !chart.contributors) {
			return;
		}

		const updatedContributors = chart.contributors?.filter(
			(contributor) => contributor.user.id !== contributorId,
		);

		this.cookieService.set(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				contributors: updatedContributors,
			}),
		);
	}
}
