import { Injectable, Type } from "@angular/core";
import { PublishHandler } from "./publish-handler.interface";

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

// Types
import { type ChartFileData } from "@/services/decode.service";

export const initialChartFormData: CreateChartModel = {
	track: "",
	artist: "",
	album: "",
	coverUrl: "",
	trackUrls: [],
	trackPreviewUrl: "",
	difficulty: Difficulty.NORMAL,
	isDeluxe: false,
	isExplicit: false,
	chartUrl: "",
	chartPreviewUrl: "",
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

	async submit(formData: CreateChartModel): Promise<ChartModel> {
		// 1. Buscar media info
		try {
			const response = await getMediaInfo(
				formData.track,
				formData.artist,
				this.cookieService,
			);
			Object.assign(formData, response);
		} catch (error: any) {
			if (!formData.coverUrl) {
				throw new Error(
					"We couldn't find the album cover. Please check your track and artist names and try again.",
				);
			}
		}

		// 2. Buscar links de streaming
		try {
			if (formData.trackUrls && formData.trackUrls.length > 0) {
				formData.trackUrls = await getTrackStreamingLinks(
					formData.trackUrls[0].url,
					formData.track,
					formData.artist,
				);
			}
		} catch {}

		// 3. Submeter chart
		const response = await this.chartService.createChart(formData);

		if (!response)
			throw new Error(
				"No response received from the server. Please try again later.",
			);

		this.cacheService.addChart(response);

		return response;
	}
}
