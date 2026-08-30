import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	type OnDestroy,
	type OnInit,
	signal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { NgGlyph } from "@ng-icons/core";
import { Subject, takeUntil } from "rxjs";

import { AuthService } from "@/services/auth.service";
import { OverviewService } from "@/services/api/overview.service";
import { PublishDialogService } from "@/services/publish/publish.service";
import {
	type OverviewResponseModel,
	type OverviewFeedItemModel,
} from "@/models/overview.model";
import { CatalogItemType } from "@/models/enums/catalog-item-type.enum";
import { abbreviateNumber } from "@/lib/number";
import { convertDateTimeToHumanReadable } from "@/lib/time";

type RangeOption = "7d" | "30d" | "all";

@Component({
	selector: "app-overview",
	imports: [NgGlyph, MatButtonModule, MatButtonToggleModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./overview.html",
})
export class OverviewComponent implements OnInit, OnDestroy {
	private overviewService = inject(OverviewService);
	private authService = inject(AuthService);
	private publishDialogService = inject(PublishDialogService);
	private cdr = inject(ChangeDetectorRef);

	private destroy$ = new Subject<void>();

	readonly abbreviateNumber = abbreviateNumber;
	readonly convertDateTimeToHumanReadable = convertDateTimeToHumanReadable;
	readonly CatalogItemType = CatalogItemType;

	loading = signal(true);
	error = signal<string | null>(null);
	data = signal<OverviewResponseModel | null>(null);
	selectedRange = signal<RangeOption>("30d");
	username = signal("");

	readonly ranges: { value: RangeOption; label: string }[] = [
		{ value: "7d", label: "7d" },
		{ value: "30d", label: "30d" },
		{ value: "all", label: "All time" },
	];

	ngOnInit(): void {
		try {
			this.username.set(this.authService.user.username);
		} catch {
			this.username.set("");
		}
		this.fetchOverview();

		this.publishDialogService.publishCompleted$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.overviewService.invalidateCache();
				this.fetchOverview();
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	fetchOverview(disableCache = false): void {
		this.loading.set(true);
		this.error.set(null);

		this.overviewService
			.getOverview(this.selectedRange(), disableCache)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					this.data.set(response);
					this.loading.set(false);
					this.cdr.markForCheck();
				},
				error: (err) => {
					console.error("Error fetching overview:", err);
					const msg =
						err?.error?.message ||
						err?.error ||
						"Failed to load overview data. Please try again.";
					this.error.set(msg);
					this.loading.set(false);
					this.cdr.markForCheck();
				},
			});
	}

	selectRange(range: RangeOption): void {
		if (this.selectedRange() === range) return;
		this.selectedRange.set(range);
		this.fetchOverview();
	}

	getFeedIcon(item: OverviewFeedItemModel): string {
		switch (item.type) {
			case "created_chart":
			case "created_tour_pass":
			case "created_theme":
				return "add_circle";
			case "liked_chart":
			case "liked_tour_pass":
			case "liked_theme":
				return "favorite";
			case "bookmarked_chart":
			case "bookmarked_tour_pass":
			case "bookmarked_theme":
				return "bookmark";
			default:
				return "circle";
		}
	}

	getFeedVerb(item: OverviewFeedItemModel): string {
		if (item.type.startsWith("created_")) return "was published";
		if (item.type.startsWith("liked_")) return "was liked";
		if (item.type.startsWith("bookmarked_")) return "was bookmarked";
		return "had activity";
	}

	getContentTypeLabel(type: CatalogItemType): string {
		switch (type) {
			case CatalogItemType.CHART:
				return "Chart";
			case CatalogItemType.TOUR_PASS:
				return "Tour pass";
			case CatalogItemType.THEME:
				return "Theme";
			default:
				return type;
		}
	}

	getContentTypeColor(type: CatalogItemType): string {
		switch (type) {
			case CatalogItemType.CHART:
				return "bg-primary text-on-primary";
			case CatalogItemType.TOUR_PASS:
				return "bg-tertiary text-on-tertiary";
			case CatalogItemType.THEME:
				return "bg-secondary text-on-secondary";
			default:
				return "bg-surface-container-high text-on-surface";
		}
	}

	getBreakdownPercent(value: number, total: number): number {
		if (total === 0) return 0;
		return Math.round((value / total) * 100);
	}
}
