import { inject, Injectable, Type } from "@angular/core";
import { PublishHandler } from "../publish-handler.interface";

// Components
import { PublishTypeComponent } from "@/components/publish/type.component";
import { PublishTourPassDetailsComponent } from "@/components/publish/tourpass/details.component";
import { PublishTourPassSetlistComponent } from "@/components/publish/tourpass/setlist.component";
import { PublishTourPassReorderComponent } from "@/components/publish/tourpass/reorder.component";
import { PublishTourPassSuccessComponent } from "@/components/publish/tourpass/success.component";

// Models
import type { ChartModel } from "@/models/chart.model";
import type {
	CreateTourPassModel,
	TourPassModel,
} from "@/models/tour-pass.model";

// Services
import { TourPassService } from "@/services/api/tour-pass.service";

export type TourPassFormData = CreateTourPassModel & {
	coverFile?: File | null;
	trailerUrl?: string | null;
	selectedCharts?: ChartModel[];
};

export const initialTourPassFormData: TourPassFormData = {
	name: "",
	description: "",
	artist: "",
	coverUrl: "",
	chartIds: [],
	coverFile: null,
	trailerUrl: "",
	selectedCharts: [],
};

@Injectable({ providedIn: "root" })
export class TourPassPublishHandler implements PublishHandler<
	TourPassFormData,
	TourPassModel
> {
	private tourPassService = inject(TourPassService);

	getStepComponents(): Type<unknown>[] {
		return [
			PublishTypeComponent,
			PublishTourPassDetailsComponent,
			PublishTourPassSetlistComponent,
			PublishTourPassReorderComponent,
		];
	}

	getInitialFormData(): TourPassFormData {
		return { ...initialTourPassFormData };
	}

	getSuccessComponent(): Type<unknown> {
		return PublishTourPassSuccessComponent;
	}

	async submit(data: TourPassFormData): Promise<TourPassModel> {
		const {
			contentType,
			coverFile,
			trailerUrl,
			selectedCharts,
			...payload
		} = data as TourPassFormData & { contentType?: string };

		const submit = {
			...payload,
			chartIds: selectedCharts?.map((chart) => chart.id) || [],
		};

		return this.tourPassService.createTourPass(
			submit as CreateTourPassModel,
		);
	}
}
