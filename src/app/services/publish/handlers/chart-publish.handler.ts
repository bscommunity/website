import { inject, Injectable, Type } from "@angular/core";
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

export type ChartFormData = CreateChartModel & {
	chartBundle: File | null;
};

export const initialChartFormData: ChartFormData = {
	chartBundle: null,
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
export class ChartPublishHandler implements PublishHandler<
	CreateChartModel,
	ChartModel
> {
	private chartService = inject(ChartService);
	private cacheService = inject(CacheService);

	getStepComponents(): Type<unknown>[] {
		return [
			PublishTypeComponent,
			PublishChartFlowComponent,
			PublishChartSourceComponent,
		];
	}

	getInitialFormData(): CreateChartModel {
		return { ...initialChartFormData };
	}

	async submit(data: ChartFormData): Promise<ChartModel> {
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
