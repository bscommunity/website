import { Component } from "@angular/core";

// Components
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { SAMPLE_CHART_1 } from "@/lib/fake";

export interface HistoryItem {
	date: Date;
	data: ChartModel[];
}

@Component({
	selector: "app-user-history",
	templateUrl: "./history.component.html",
	imports: [ChartPreviewComponent],
})
export class UserHistoryComponent {
	items: HistoryItem[] = [
		{
			data: [SAMPLE_CHART_1, SAMPLE_CHART_1],
			date: new Date("2024-06-01"),
		},
		{
			data: [SAMPLE_CHART_1],
			date: new Date("2024-06-01"),
		},
	];
}
