import { Injectable } from "@angular/core";

// Services
import { CookieService } from "./cookie.service";

// Models
import { ChartModel } from "@/models/chart.model";
import { ContributorModel } from "@/models/contributor.model";
import { VersionModel } from "@/models/version.model";

const MAX_CACHED_CHARTS = 5;

interface CachedChart extends ChartModel {
	lastAccessed: string;
	isFull: boolean;
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
	 * @returns {ChartModel[] | undefined} An array of ChartModel objects if the "charts" cookie is found; otherwise, undefined.
	 */
	getAllCharts(): ChartModel[] | undefined {
		const cookies = this.cookieService.getAll();

		const charts = Object.keys(cookies)
			.filter((key) => key.startsWith("chart_"))
			.map((key) => JSON.parse(cookies[key]));

		return charts;
	}

	getChart(id: string): CachedChart | undefined {
		const chart = this.cookieService.get(`chart_${id}`);

		return chart ? JSON.parse(chart) : undefined;
	}

	addChart(chart: ChartModel, isFull: boolean = true): void {
		// If we have reached the maximum number of cached charts, we need to remove the oldest one
		if (this.getChartCount() >= MAX_CACHED_CHARTS) {
			const allCharts = this.getAllCharts() as CachedChart[];

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
				isFull,
			}),
		);

		this.increaseChartCount();
	}

	addCharts(charts: ChartModel[]): void {
		const currentCharts = this.getAllCharts();
		charts.forEach((chart) => {
			if (
				!currentCharts ||
				!currentCharts.some((c) => c.id === chart.id)
			) {
				this.addChart(chart, false);
			} else {
				this.updateChart(chart);
			}
		});
	}

	removeChart(id: string): void {
		// If the chart exists, we remove it from the cache
		if (this.getChart(id)) {
			this.cookieService.delete(`chart_${id}`);
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

	// Contributors

	updateChartContributors(
		id: string,
		newContributors: ContributorModel[],
	): void {
		const chart = this.getChart(id);
		if (!chart) {
			return;
		}

		// Get the current list of contributors, if any
		const currentContributors = chart.contributors || [];

		// Merge contributors: update existing ones and add any new ones
		const mergedContributors = currentContributors.map((contributor) => {
			const updated = newContributors.find(
				(newC) => newC.user.id === contributor.user.id,
			);
			return updated ? updated : contributor;
		});

		newContributors.forEach((newContributor) => {
			if (
				!currentContributors.some(
					(c) => c.user.id === newContributor.user.id,
				)
			) {
				mergedContributors.push(newContributor);
			}
		});

		this.cookieService.set(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				contributors: mergedContributors,
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

	// Versions

	addVersion(id: string, version: VersionModel): void {
		const chart = this.getChart(id);

		if (!chart) {
			return;
		}

		const versions = chart.versions || [];

		versions.push(version);

		this.cookieService.set(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				versions,
			}),
		);
	}

	removeVersion(id: string, versionId: string): void {
		const chart = this.getChart(id);

		if (!chart || !chart.versions) {
			return;
		}

		const updatedVersions = chart.versions.filter(
			(version) => version.id !== versionId,
		);

		this.cookieService.set(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				versions: updatedVersions,
			}),
		);
	}
}
