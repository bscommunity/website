import { Injectable, inject } from "@angular/core";

// Services
import { StorageService } from "./storage.service";
import { CookieService } from "./cookie.service";

// Models
import { ChartModel } from "@/models/chart.model";
import { ContributorModel } from "@/models/contributor.model";
import { VersionModel } from "@/models/version.model";
import { KnownIssueModel } from "@/models/known-issue.model";
import { SortOption } from "@/models/enums/sort-option.enum";

const MAX_CACHED_CHARTS_PERSISTENT = 20;
const MAX_CACHED_CHARTS_SESSION = 30;
const CACHE_VALIDITY_HOURS = 4;
const DEFAULT_CHARTS_CACHE_KEY = "defaultChartsCache";

interface CachedChart extends ChartModel {
	lastAccessed: string;
}

interface DefaultCacheMetadata {
	timestamp: string;
	filters: string; // JSON stringified filters
}

interface DefaultChartsCachePayload {
	charts: ChartModel[];
	total: number;
}

export type STORAGE = "persistent" | "session";

@Injectable({
	providedIn: "root",
})
export class CacheService {
	private storageService = inject(StorageService);
	private cookieService = inject(CookieService);

	public get isOnRefreshCooldown(): boolean {
		const lastRefresh = this.cookieService.get("lastRefresh");
		if (!lastRefresh) {
			return false;
		}

		const lastRefreshDate = new Date(lastRefresh);
		const currentDate = new Date();

		const timeDiff = currentDate.getTime() - lastRefreshDate.getTime();
		const diffInMinutes = Math.floor(timeDiff / (1000 * 60)); // Convert to minutes

		return diffInMinutes < 5; // 5 minutes cooldown
	}

	public setRefreshCooldown(): void {
		this.cookieService.set("lastRefresh", new Date().toISOString(), {
			expires: 5 / (24 * 60), // 5 minutes in days
		});
	}

	/**
	 * Checks if the default cache is still valid (within 4 hours)
	 */
	public isDefaultCacheValid(): boolean {
		const metadata = this.storageService.getItem("defaultCacheMetadata");
		if (!metadata) {
			return false;
		}

		try {
			const parsed: DefaultCacheMetadata = JSON.parse(metadata);
			const cacheDate = new Date(parsed.timestamp);
			const currentDate = new Date();
			const hoursDiff =
				(currentDate.getTime() - cacheDate.getTime()) /
				(1000 * 60 * 60);

			return hoursDiff < CACHE_VALIDITY_HOURS;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Sets metadata for default cache (no filters/queries)
	 */
	public setDefaultCacheMetadata(filters: any): void {
		const metadata: DefaultCacheMetadata = {
			timestamp: new Date().toISOString(),
			filters: JSON.stringify(filters),
		};
		this.storageService.setItem(
			"defaultCacheMetadata",
			JSON.stringify(metadata),
		);
	}

	/**
	 * Gets the stored default cache metadata
	 */
	public getDefaultCacheMetadata(): DefaultCacheMetadata | null {
		const metadata = this.storageService.getItem("defaultCacheMetadata");
		if (!metadata) {
			return null;
		}
		try {
			return JSON.parse(metadata);
		} catch (error) {
			return null;
		}
	}

	/**
	 * Checks if current filters match the default cache
	 */
	public isDefaultFilters(filters: any): boolean {
		if (!filters) return true;

		const hasQuery = filters.query && filters.query.trim() !== "";
		const hasGenres = filters.genres && filters.genres.length > 0;
		const hasDifficulties =
			filters.difficulties && filters.difficulties.length > 0;
		const hasCategories =
			filters.categories && filters.categories.length > 0;
		const hasVersions = filters.versions && filters.versions.length > 0;
		const hasCustomSort =
			filters.sortBy && filters.sortBy !== SortOption.LAST_UPDATED;

		return (
			!hasQuery &&
			!hasGenres &&
			!hasDifficulties &&
			!hasCategories &&
			!hasVersions &&
			!hasCustomSort
		);
	}

	public setDefaultChartsCache(charts: ChartModel[], total: number): void {
		const payload: DefaultChartsCachePayload = {
			charts,
			total,
		};
		this.storageService.setItem(
			DEFAULT_CHARTS_CACHE_KEY,
			JSON.stringify(payload),
		);
	}

	public getDefaultChartsCache(): DefaultChartsCachePayload | null {
		const cached = this.storageService.getItem(DEFAULT_CHARTS_CACHE_KEY);
		if (!cached) {
			return null;
		}

		try {
			const parsed = JSON.parse(cached) as DefaultChartsCachePayload;
			if (
				!Array.isArray(parsed.charts) ||
				typeof parsed.total !== "number"
			) {
				throw new Error("Invalid default cache payload");
			}
			return parsed;
		} catch (error) {
			this.storageService.removeItem(DEFAULT_CHARTS_CACHE_KEY);
			return null;
		}
	}

	private getChartCount(): number {
		return parseInt(this.storageService.getItem("chartCount") || "0");
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
	 * Retrieves all charts stored in the browser's localStorage and removes those not found remotely.
	 *
	 * @param storage - The type of storage to use ("persistent" for localStorage, "session" for sessionStorage). Default is "persistent".
	 * @param remoteChartIds - List of chart IDs found remotely.
	 * @returns {ChartModel[] | undefined} An array of ChartModel objects if the "charts" object is found; otherwise, undefined.
	 */
	getAllCharts(
		storage: STORAGE = "persistent",
		remoteChartIds?: string[],
	): ChartModel[] | undefined {
		const charts = Object.keys(
			storage === "persistent"
				? window.localStorage
				: window.sessionStorage,
		)
			.filter((key) => key.startsWith("chart_"))
			.filter((key) =>
				this.storageService.getItem(key, storage === "session"),
			)
			.map(
				(key) =>
					JSON.parse(
						this.storageService.getItem(
							key,
							storage === "session",
						)!,
					) as CachedChart,
			);

		// Remove cached charts not found remotely if remoteChartIds is provided
		if (remoteChartIds) {
			charts.forEach((chart) => {
				if (!remoteChartIds.includes(chart.id)) {
					this.removeChart(chart.id);
				}
			});
		}

		return charts;
	}

	getChart(
		id: string,
		storage: STORAGE = "persistent",
	): CachedChart | undefined {
		const chart = this.storageService.getItem(
			`chart_${id}`,
			storage === "session",
		);
		return chart ? JSON.parse(chart) : undefined;
	}

	addChart(
		chart: ChartModel,
		maxCache: number = MAX_CACHED_CHARTS_PERSISTENT,
	): void {
		// If we have reached the maximum number of cached charts, we need to remove the oldest one
		if (this.getChartCount() >= maxCache) {
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

		// Usar getItem ao invés de 'in' para evitar problemas de verificação
		const cacheKey = `chart_${chart.id}`;

		if (localStorage.getItem(cacheKey) !== null) {
			return this.updateChart(chart);
		}

		this.storageService.setItem(
			cacheKey,
			JSON.stringify({
				...chart,
				lastAccessed: new Date().toISOString(),
			}),
		);

		this.increaseChartCount();
	}

	addCharts(charts: ChartModel[], storage: STORAGE = "persistent"): void {
		console.log("Adding charts to cache:", charts);

		const currentCharts = this.getAllCharts(storage);
		const currentChartIds = currentCharts?.map((chart) => chart.id);

		// Remove charts that are not in the new list
		if (currentChartIds) {
			currentChartIds.forEach((id) => {
				if (!charts.some((chart) => chart.id === id)) {
					this.removeChart(id);
				}
			});
		}

		charts.forEach((chart) => {
			if (
				!currentCharts ||
				!currentCharts.some((c) => c.id === chart.id)
			) {
				this.addChart(
					chart,
					storage === "persistent"
						? MAX_CACHED_CHARTS_PERSISTENT
						: MAX_CACHED_CHARTS_SESSION,
				);
			} else {
				this.updateChart(chart, storage);
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

	updateChart(
		updatedChart: ChartModel,
		storage: STORAGE = "persistent",
	): void {
		const chart = this.getChart(updatedChart.id);

		if (!chart) {
			return;
		}

		this.storageService.setItem(
			`chart_${updatedChart.id}`,
			JSON.stringify({
				...updatedChart,
				lastAccessed: new Date().toISOString(),
			}),
			storage === "session",
		);

		console.log(`Chart ${updatedChart.id} updated in cache.`);
		/* console.log(
			`Chart ${updatedChart.id} updated in cache:`,
			this.getChart(updatedChart.id),
		); */
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

		let versions = chart.versions || [];
		versions[0]?.knownIssues.push(knownIssue);

		this.storageService.setItem(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				versions,
			}),
		);
	}

	removeIssue(id: string, knownIssueId: string): void {
		const chart = this.getChart(id);

		if (!chart || !chart.versions) {
			return;
		}

		const updatedVersions = chart.versions.map((version) => {
			return {
				...version,
				knownIssues: version.knownIssues.filter(
					(issue) => issue.id !== knownIssueId,
				),
			};
		});

		this.storageService.setItem(
			`chart_${id}`,
			JSON.stringify({
				...chart,
				versions: updatedVersions,
			}),
		);
	}

	clearCache(): void {
		/* const keys = this.storageService.getItem("chartKeys");

		if (keys) {
			const storedKeys = JSON.parse(keys) as string[];
			storedKeys.forEach((key) => {
				if (key.startsWith("chart_")) {
					this.storageService.removeItem(key);
				}
			});
		}

		this.storageService.removeItem("chartCount");
		this.storageService.removeItem("chartKeys"); */

		this.storageService.clear();
		this.storageService.clear(true); // Clear sessionStorage too
		this.cookieService.delete("lastRefresh");
	}
}
