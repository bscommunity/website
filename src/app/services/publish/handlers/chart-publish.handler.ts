import { Injectable, Type } from "@angular/core";
import { PublishHandler } from "../publish-handler.interface";

// Components
import { PublishTypeComponent } from "@/components/publish/type.component";
import { PublishChartFlowComponent } from "@/components/publish/chart/flow.component";
import { PublishChartSourceComponent } from "@/components/publish/chart/source.component";

// Models
import { Difficulty } from "@/models/enums/difficulty.enum";
import { ChartModel, CreateChartModel } from "@/models/chart.model";

// Services
import { ChartService } from "@/services/api/chart.service";
import { CacheService } from "@/services/cache.service";
import { CookieService } from "@/services/cookie.service";

// Libraries
import { getMediaInfo, getTrackStreamingLinks } from "@/lib/assets";
import { BundleZipData, ExtractService } from "@/services/extract.service";
import { ChartFileData, DecodeService } from "@/services/decode.service";
import { VersionModel } from "@/models/version.model";
import { similarity } from "@/lib/compare";

export type ChartFormData = CreateChartModel & {
	chartFile: File | null;
	chartBundle: File | null;
};

export const initialChartFormData: ChartFormData = {
	// Ephemeral data
	chartFile: null,
	chartBundle: null,
	// Form data
	// These fields are used to create the chart
	track: "",
	artist: "",
	album: "",
	coverUrl: "",
	trackUrls: [],
	trackPreviewUrl: "",
	difficulty: Difficulty.NORMAL,
	isDeluxe: false,
	isExplicit: false,
	bundleUrl: "",
	previewUrl: "",
	duration: 0,
	notesAmount: 0,
	bpm: 0,
	effectsAmount: 0,
	genre: undefined,
};

@Injectable({ providedIn: "root" })
export class ChartPublishHandler
	implements PublishHandler<CreateChartModel, ChartModel>
{
	constructor(
		private extractService: ExtractService,
		private decodeService: DecodeService,
		private chartService: ChartService,
		private cacheService: CacheService,
		private cookieService: CookieService,
	) {}

	getStepComponents(): Type<any>[] {
		return [
			PublishTypeComponent,
			PublishChartFlowComponent,
			PublishChartSourceComponent,
		];
	}

	getInitialFormData(): CreateChartModel {
		return { ...initialChartFormData };
	}

	/**
	 * Fetches the bundle zip from the provided URL and processes it
	 */
	private async processBundleUrl(
		bundleUrl: string,
	): Promise<Partial<ChartFormData>> {
		try {
			const file = await this.extractService.fetchBundleZip(bundleUrl);
			if (file) {
				console.log("Bundle zip data fetched successfully:", file);
				return await this.processBundleFile(file);
			} else {
				throw new Error(
					`Failed to fetch bundle zip from URL: ${bundleUrl}`,
				);
			}
		} catch (error) {
			throw new Error(
				`Failed to fetch bundle zip from URL: ${bundleUrl}`,
			);
		}
	}

	/**
	 * Process bundle file data and update form fields
	 */
	private async processBundleFile(
		bundleFile: File,
	): Promise<Partial<ChartFormData>> {
		try {
			const bundleZipData: BundleZipData =
				await this.extractService.extractBundleZipData(bundleFile);

			console.log(
				"Bundle file data processed successfully:",
				bundleZipData,
			);

			return await this.processBundleFileData(bundleZipData);
		} catch (error) {
			throw new Error("Failed to process bundle file");
		}
	}

	/**
	 * Process bundle file data and update form fields
	 */
	private async processBundleFileData(
		bundleZipData: BundleZipData,
	): Promise<Partial<ChartFormData>> {
		let difficulty: Difficulty;
		switch (bundleZipData.difficulty) {
			case 4:
				difficulty = Difficulty.NORMAL;
				break;
			case 3:
				difficulty = Difficulty.HARD;
				break;
			case 1:
				difficulty = Difficulty.EXTREME;
				break;
			default:
				difficulty = Difficulty.NORMAL;
				break;
		}

		return {
			track: bundleZipData.title,
			artist: bundleZipData.artist,
			difficulty: difficulty,
			bpm: bundleZipData.bpm,
			isDeluxe: bundleZipData.type === "Promode",
		};
	}

	/**
	 * Process chart file data and update form fields
	 */
	private async processChartFile(chartFile: File): Promise<ChartFileData> {
		try {
			const data = await this.decodeService.decodeChartFile(chartFile);
			console.log("Chart file data processed successfully:", data);

			if (!data) {
				throw new Error("Invalid chart file data");
			}

			return data;
		} catch (error) {
			console.error("Failed to process chart file:", error);
			throw new Error("Failed to process chart file");
		}
	}

	async preprocessFormData(
		formData: ChartFormData,
	): Promise<CreateChartModel> {
		let data = { ...formData };

		// 0. Process bundle/chart files if present
		if (!formData.chartFile) {
			throw new Error(
				"Please provide a chart file or bundle to proceed.",
			);
		}

		try {
			let bundleData: Partial<ChartFormData> | undefined;

			if (formData.chartBundle) {
				bundleData = await this.processBundleFile(formData.chartBundle);
			} else if (formData.bundleUrl) {
				bundleData = await this.processBundleUrl(formData.bundleUrl);
			}

			// Merge bundle data with form data
			if (bundleData) {
				data = { ...data, ...bundleData };
			}
		} catch (error: any) {
			throw new Error(
				error?.message || "Failed to process uploaded files.",
			);
		}

		// Process the chart file
		try {
			const chartFileData = await this.processChartFile(
				formData.chartFile,
			);
			data = { ...data, ...chartFileData };
		} catch (error: any) {
			throw new Error(error?.message || "Failed to process chart file.");
		}

		// 3. Return the processed data
		const { chartFile, ...createChartData } = data;

		return createChartData;
	}

	async preprocessMediaInfo(
		formData: CreateChartModel,
	): Promise<CreateChartModel> {
		let data = { ...formData };

		// 1. Search for media info
		try {
			const response = await getMediaInfo(
				data.track,
				data.artist,
				this.cookieService,
			);
			Object.assign(data, response);
		} catch (error: any) {
			if (!data.coverUrl) {
				throw new Error(
					"We couldn't find the album cover. Please check your track and artist names and try again.",
				);
			}
		}

		// 2. Fetch streaming links
		try {
			if (data.trackUrls && data.trackUrls.length > 0) {
				data.trackUrls = await getTrackStreamingLinks(
					data.trackUrls[0].url,
					data.track,
					data.artist,
				);
			}
		} catch {
			// Ignore errors fetching streaming links
			console.warn(
				"Failed to fetch streaming links, proceeding without them.",
			);
		}

		return data;
	}

	validate(chart: Partial<ChartModel>, formData: ChartFormData): boolean {
		if (!chart || !chart.track || !chart.artist) {
			throw new Error(
				"Chart data is incomplete. Please ensure the chart has a track and artist.",
			);
		}

		const trackSimilarity = similarity(
			chart.track.toLowerCase().trim().replace(/\s+/g, " "),
			formData.track.toLowerCase().trim().replace(/\s+/g, " "),
		);

		if (trackSimilarity < 0.8) {
			throw new Error(
				`The track name does not match the previously published chart. Please ensure the track is correct.`,
			);
		}

		return true;
	}

	async submit(formData: ChartFormData): Promise<ChartModel> {
		let data = await this.preprocessFormData(formData);
		data = await this.preprocessMediaInfo(data);

		const response = await this.chartService.createChart(data);

		if (!response)
			throw new Error(
				"No response received from the server. Please try again later.",
			);

		console.log("Chart created successfully:", response);

		this.cacheService.addChart(response);

		return response;
	}
}
