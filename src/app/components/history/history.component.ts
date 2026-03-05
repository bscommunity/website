import { Component, Input, Output, EventEmitter } from "@angular/core";

// Components
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { ActivityType, SimplifiedUserModel } from "@/models/user.model";
import { convertDateTimeToHumanReadable } from "@/lib/time";

export interface HistoryActivityEntry {
	type: ActivityType;
	chart?: ChartModel;
	user?: SimplifiedUserModel;
}

export interface HistoryItem {
	date: Date;
	data: ChartModel[];
	label?: string;
	actionType?: ActivityType;
	activities?: HistoryActivityEntry[];
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

	getActionIcon(actionType: ActivityType | undefined): string | null {
		if (!actionType) return null;
		switch (actionType) {
			case ActivityType.CREATED_CHART:
				return "add";
			case ActivityType.LIKED_CHART:
				return "favorite";
			case ActivityType.BOOKMARKED_CHART:
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
		return item.data.map((chart) => ({
			type: ActivityType.CREATED_CHART,
			chart,
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
