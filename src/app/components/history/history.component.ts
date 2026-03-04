import { Component, Input, Output, EventEmitter } from "@angular/core";

// Components
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { convertDateTimeToHumanReadable } from "@/lib/time";

export interface HistoryItem {
	date: Date;
	data: ChartModel[];
	label?: string;
}

@Component({
	selector: "app-user-history",
	templateUrl: "./history.component.html",
	imports: [ChartPreviewComponent],
})
export class UserHistoryComponent {
	@Input() items: HistoryItem[] | null | undefined = undefined;
	@Output() chartClick = new EventEmitter<ChartModel>();
	readonly convertDateTimeToHumanReadable = convertDateTimeToHumanReadable;
}
