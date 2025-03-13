import { Injectable } from "@angular/core";

// Services
import { StorageService } from "./storage.service";

// Models
import { ChartModel } from "@/models/chart.model";
import { ContributorModel } from "@/models/contributor.model";
import { VersionModel } from "@/models/version.model";
import { KnownIssueModel } from "@/models/known-issue.model";

const MAX_CACHED_CHARTS = 5;

interface CachedChart extends ChartModel {
	lastAccessed: string;
	isFull: boolean;
}

@Injectable({
	providedIn: "root",
})
export class CacheService {
	constructor(private storageService: StorageService) {}

	private getChartCount(): number {
		return parseInt(this.storageService.getItem("chartCount") || "0");
	}

	private addChartKey(key: string): void {
		let keys = [];
		const storageKeys = this.storageService.getItem("chartKeys");

		if (storageKeys) {
			keys = JSON.parse(storageKeys);
		}

		keys.push(key);

		this.storageService.setItem("chartKeys", JSON.stringify(keys));
	}

	private increaseChartCount(): void {
		this.storageService.setItem(
			"chartCount",
			(this.getChartCount() + 1).toString(),
		);
	}

	private decreaseChartCount(): void {
		this.storageService.setItem(
			"chartCount",
			(this.getChartCount() - 1).toString(),
		);
	}

	/**
	 * Retrieves all charts stored in the browser's localStorage.
	 *
	 * @returns {ChartModel[] | undefined} An array of ChartModel objects if the "charts" object is found; otherwise, undefined.
	 */
	getAllCharts(): ChartModel[] | undefined {
		const keys = this.storageService.getItem("chartKeys");

		if (!keys) {
			return undefined;
		}

		const storedItems = JSON.parse(keys) as string[];
		const charts = storedItems
			.filter((key) => key.startsWith("chart_"))
			.filter((key) => this.storageService.getItem(key))
			.map(
				(key) =>
					JSON.parse(
						this.storageService.getItem(key)!,
					) as CachedChart,
			);

		return charts;
	}

	getChart(id: string): CachedChart | undefined {
		const chart = this.storageService.getItem(`chart_${id}`);
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

		if (cacheKey in localStorage) {
			return this.updateChart(chart, true);
		}

		this.storageService.setItem(
			cacheKey,
			JSON.stringify({
				...chart,
				lastAccessed: new Date().toISOString(),
				isFull,
			}),
		);

		this.increaseChartCount();
		this.addChartKey(cacheKey);
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
			this.storageService.removeItem(`chart_${id}`);
			this.decreaseChartCount();
		}
	}

	updateChart(updatedChart: ChartModel, isFull = false): void {
		const chart = this.getChart(updatedChart.id);

		if (!chart) {
			return;
		}

		this.storageService.setItem(
			`chart_${updatedChart.id}`,
			JSON.stringify({
				...updatedChart,
				lastAccessed: new Date().toISOString(),
				isFull,
			}),
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

		this.storageService.setItem(
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

		this.storageService.setItem(
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

		this.storageService.setItem(
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

		this.storageService.setItem(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				versions: updatedVersions,
			}),
		);
	}

	// Known Issues

	addIssue(id: string, knownIssue: KnownIssueModel): void {
		const chart = this.getChart(id);

		if (!chart) {
			return;
		}

		const knownIssues = chart.latestVersion?.knownIssues || [];
		knownIssues.push(knownIssue);

		this.storageService.setItem(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				latestVersion: {
					...chart.latestVersion,
					knownIssues,
				},
			}),
		);
	}

	removeIssue(id: string, knownIssueId: string): void {
		const chart = this.getChart(id);

		if (!chart || !chart.latestVersion?.knownIssues) {
			return;
		}

		const updatedKnownIssues = chart.latestVersion.knownIssues.filter(
			(knownIssue) => knownIssue.id !== knownIssueId,
		);

		this.storageService.setItem(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				latestVersion: {
					...chart.latestVersion,
					knownIssues: updatedKnownIssues,
				},
			}),
		);
	}
}
