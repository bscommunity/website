import { Injectable, inject, type Type } from "@angular/core";
import { PublishChartFlowComponent } from "@/components/publish/chart/flow.component";
import { PublishChartSourceComponent } from "@/components/publish/chart/source.component";
import { PublishDialogSuccessComponent } from "@/components/publish/success.component";
// Components
import { PublishTypeComponent } from "@/components/publish/type.component";
import type { ChartModel } from "@/models/chart.model";

// Models
import { Difficulty } from "@/models/enums/difficulty.enum";
import type { Genre } from "@/models/enums/genre.enum";
// Enums
import type { StreamingLinkModel } from "@/models/streaming-link.model";

// Services
import { ChartService, type CreateChartPayload } from "@/services/api/chart.service";
import { CacheService } from "@/services/cache.service";
import type { PublishHandler } from "../publish-handler.interface";

export interface ChartFormData {
	chartBundle: File | null;
	track: string;
	artist: string;
	album: string | null;
	coverUrl: string | null;
	streamingRefs: StreamingLinkModel[];
	trackPreviewUrl: string | null;
	difficulty: Difficulty;
	isDeluxe: boolean;
	isExplicit: boolean;
	notesAmount: number;
	bpm: number | null;
	effectsAmount: number;
	genre: Genre | null;
	duration: number;
}

export const initialChartFormData: ChartFormData = {
	chartBundle: null,
	track: "",
	artist: "",
	album: null,
	coverUrl: null,
	streamingRefs: [],
	trackPreviewUrl: null,
	difficulty: Difficulty.NORMAL,
	isDeluxe: false,
	isExplicit: false,
	notesAmount: 0,
	bpm: null,
	effectsAmount: 0,
	genre: null,
	duration: 0,
};

@Injectable({ providedIn: "root" })
export class ChartPublishHandler
	implements PublishHandler<ChartFormData, ChartModel>
{
	private chartService = inject(ChartService);
	private cacheService = inject(CacheService);

	getStepComponents(): Type<unknown>[] {
		return [
			PublishTypeComponent,
			PublishChartFlowComponent,
			PublishChartSourceComponent,
		];
	}

	getInitialFormData(): ChartFormData {
		return { ...initialChartFormData };
	}

	getSuccessComponent(): Type<unknown> {
		return PublishDialogSuccessComponent;
	}

	async submit(data: ChartFormData, publishSessionId?: string): Promise<ChartModel> {
		const {
			chartBundle,
			coverUrl,
			trackPreviewUrl,
			streamingRefs,
			track,
			artist,
			album,
			genre,
			bpm,
			duration,
			notesAmount,
			effectsAmount,
			isDeluxe,
			isExplicit,
			difficulty,
		} = data;

		const extra = data as ChartFormData & { previewUrl?: string; bundleUrl?: string };

		const payload: CreateChartPayload = {
			artist,
			track,
			album: album ?? null,
			trackUrls: streamingRefs ?? [],
			previewUrl: extra.previewUrl ?? null,
			trackPreviewUrl: trackPreviewUrl ?? null,
			coverUrl: coverUrl ?? null,
			genre: genre ?? null,
			isExplicit,
			duration,
			notesAmount,
			effectsAmount,
			bpm: bpm ?? null,
			difficulty,
			isDeluxe,
			chartBundle: chartBundle ?? undefined,
		};

		const response = await this.chartService.createChart(payload, publishSessionId);

		if (!response)
			throw new Error(
				"No response received from the server. Please try again later.",
			);

		console.log("Chart created successfully:", response);

		this.cacheService.addChart(response);

		return response;
	}
}
