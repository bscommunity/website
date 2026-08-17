import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
} from "@angular/core";
import { CommonModule } from "@angular/common";

// Material
import { NgGlyph } from "@ng-icons/core";

// Components
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { TourPassModel } from "@/models/tour-pass.model";
import { SimplifiedUserModel } from "@/models/user.model";
import { ActivityType } from "@/models/enums/activity-type.enum";
import { convertDateTimeToHumanReadable } from "@/lib/time";

export type HistoryDataItem = ChartModel | TourPassModel;

export interface HistoryActivityEntry {
	type: ActivityType;
	chart?: ChartModel;
	user?: SimplifiedUserModel;
}

export interface HistoryItem {
	date: Date;
	data: HistoryDataItem[];
	label?: string;
	actionType?: ActivityType;
	activities?: HistoryActivityEntry[];
}

@Component({
	selector: "app-user-history",
	templateUrl: "./history.component.html",
	imports: [CommonModule, NgGlyph, ChartPreviewComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserHistoryComponent {
	@Input() items: HistoryItem[] | null | undefined = undefined;
	@Output() chartClick = new EventEmitter<ChartModel>();
	readonly convertDateTimeToHumanReadable = convertDateTimeToHumanReadable;

	getActionIcon(actionType: ActivityType | undefined): string | null {
		if (!actionType) return null;
		switch (actionType) {
			case ActivityType.CREATED_CHART:
			case ActivityType.CREATED_TOUR_PASS:
			case ActivityType.CREATED_THEME:
				return "add";
			case ActivityType.LIKED_CHART:
			case ActivityType.LIKED_TOUR_PASS:
			case ActivityType.LIKED_THEME:
				return "favorite";
			case ActivityType.BOOKMARKED_CHART:
			case ActivityType.BOOKMARKED_TOUR_PASS:
			case ActivityType.BOOKMARKED_THEME:
				return "bookmark";
			case ActivityType.FOLLOWED_USER:
				return "person_add";
			default:
				return "history";
		}
	}

	getChartActivities(item: HistoryItem): HistoryActivityEntry[] {
		const source = item.activities ?? [];
		if (source.length > 0) {
			return source.filter((entry) => Boolean(entry.chart));
		}
		return item.data.map((entry) => ({
			type: ActivityType.CREATED_CHART,
			chart: (entry as ChartModel),
		}));
	}

	getUserActivities(item: HistoryItem): HistoryActivityEntry[] {
		return (item.activities ?? []).filter((entry) => Boolean(entry.user));
	}

	formatUserInfo(user: SimplifiedUserModel | undefined): string {
		if (!user) {
			return "Followed user";
		}
		return `Followed @${user.username} (id: ${user.id})`;
	}
}
