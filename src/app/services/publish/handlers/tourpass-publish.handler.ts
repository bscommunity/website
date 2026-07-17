import { Injectable, inject, type Type } from "@angular/core";
import { PublishTourPassDetailsComponent } from "@/components/publish/tourpass/details.component";
import { PublishTourPassReorderComponent } from "@/components/publish/tourpass/reorder.component";
import { PublishTourPassSetlistComponent } from "@/components/publish/tourpass/setlist.component";
import { PublishTourPassSuccessComponent } from "@/components/publish/tourpass/success.component";
// Components
import { PublishTypeComponent } from "@/components/publish/type.component";
// Models
import type { ChartModel } from "@/models/chart.model";
import type {
	CreateTourPassModel,
	TourPassModel,
} from "@/models/tour-pass.model";
// Services
import { TourPassService } from "@/services/api/tour-pass.service";
import type { PublishHandler } from "../publish-handler.interface";

export type TourPassFormData = CreateTourPassModel & {
	coverFile?: File | null;
	coverUrl?: string | null;
	trailerUrl?: string | null;
	selectedCharts?: ChartModel[];
};

export const initialTourPassFormData: TourPassFormData = {
	name: "",
	description: "",
	artist: "",
	coverId: null,
	chartIds: [],
	coverFile: null,
	coverUrl: "",
	trailerUrl: "",
	selectedCharts: [],
};

@Injectable({ providedIn: "root" })
export class TourPassPublishHandler
	implements PublishHandler<TourPassFormData, TourPassModel>
{
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
			coverUrl,
			trailerUrl,
			selectedCharts,
			...payload
		} = data as TourPassFormData & { contentType?: string };

		const submit = {
			...payload,
			chartIds: selectedCharts?.map((chart) => chart.id) || [],
		};

		return this.tourPassService.createTourPass(submit as CreateTourPassModel);
	}
}
