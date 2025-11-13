import {
	Component,
	OnInit,
	signal,
	input,
	Output,
	EventEmitter,
	OnDestroy,
	inject,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

// Material
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatSliderModule } from "@angular/material/slider";
import { MatChipsModule } from "@angular/material/chips";

// Components
import {
	ExpansionPanelComponent,
	ExpansionPanelData,
} from "@/components/expansion-panel/expansion-panel.component";

// Services
import { FilterService } from "@/services/filter.service";
import type { WorkshopFilters } from "@/services/filter.service";

// Models
import { Difficulty, getDifficultyLabel } from "@/models/enums/difficulty.enum";
import { Genre, getGenreLabel } from "@/models/enums/genre.enum";

const difficulties: ExpansionPanelData[] = Object.values(Difficulty)
	.map((name) => ({
		name: getDifficultyLabel(name as Difficulty),
		value: name,
	}))
	.filter((d) => d.name !== "Normal");

const genres: ExpansionPanelData[] = Object.values(Genre).map((name) => ({
	name: getGenreLabel(name as Genre),
	value: name,
}));

const versions: ExpansionPanelData[] = [{ name: "Deluxe" }];

const categories: ExpansionPanelData[] = [
	{ name: "Charts" },
	{ name: "Tourpasses" },
	{ name: "Themes" },
];

@Component({
	selector: "app-filter-panel",
	imports: [
		MatIconModule,
		MatExpansionModule,
		MatSliderModule,
		MatChipsModule,
		ExpansionPanelComponent,
	],
	templateUrl: "./filter-panel.component.html",
})
export class FilterPanelComponent implements OnInit, OnDestroy {
	private filterService = inject(FilterService);

	readonly startDate = input<string | null>(null);
	readonly endDate = input<string | null>(null);
	readonly initialSelected = input<ExpansionPanelData[]>([]);
	readonly disabled = input<boolean>(false);

	@Output() filterChange = new EventEmitter<ExpansionPanelData[]>();

	private filterSubject = new Subject<ExpansionPanelData[]>();
	private filterSubscription!: Subscription;
	private isSyncingFromService = false;

	private _difficulties = difficulties;
	private _genres = genres;
	private _versions = versions;
	private _categories = categories;

	categories: ExpansionPanelData[] = this._categories;
	difficulties: ExpansionPanelData[] = this._difficulties;
	genres: ExpansionPanelData[] = this._genres;
	versions: ExpansionPanelData[] = this._versions;

	selectedItems: ExpansionPanelData[] = [];

	readonly datePanelOpenState = signal(false);

	ngOnInit(): void {
		// Setup debounced filter updates
		this.filterSubscription = this.filterSubject
			.pipe(debounceTime(600))
			.subscribe(() => {
				if (!this.isSyncingFromService) {
					this.updateFiltersInService();
				}
			});

		// Initialize selections from service state
		this.applyFiltersToSelections(this.filterService.getFilters());
	}

	ngOnDestroy(): void {
		if (this.filterSubscription) {
			this.filterSubscription.unsubscribe();
		}
	}

	onFilterChange(data: ExpansionPanelData[] | null): void {
		if (this.disabled() || this.isSyncingFromService) {
			return;
		}

		if (data) {
			this.selectedItems = [
				...this.categories.filter((c) => c.isSelected),
				...this.difficulties.filter((d) => d.isSelected),
				...this.genres.filter((g) => g.isSelected),
				...this.versions.filter((v) => v.isSelected),
			];
			this.filterSubject.next(this.selectedItems);
			this.filterChange.emit(this.selectedItems);
		}
	}

	/**
	 * Update service with selected filters
	 */
	private updateFiltersInService(): void {
		const selectedCategories = this.categories
			.filter((c) => c.isSelected)
			.map((c) => c.name || "");

		const selectedDifficulties = this.difficulties
			.filter((d) => d.isSelected)
			.map((d) => d.value || "")
			.filter((v) => v);

		const selectedGenres = this.genres
			.filter((g) => g.isSelected)
			.map((g) => g.value || "")
			.filter((v) => v);

		const selectedVersions = this.versions
			.filter((v) => v.isSelected)
			.map((v) => v.name || "");

		this.filterService.updateFilters({
			categories: selectedCategories,
			difficulties: selectedDifficulties,
			genres: selectedGenres,
			versions: selectedVersions,
		});
	}

	/**
	 * Reflect provided filters in the local selection state
	 */
	private applyFiltersToSelections(filters: WorkshopFilters): void {
		this.isSyncingFromService = true;

		this.categories.forEach((category) => {
			category.isSelected =
				filters.categories?.includes(category.name) || false;
		});

		this.difficulties.forEach((difficulty) => {
			difficulty.isSelected =
				(filters.difficulties?.includes(difficulty.value || "") ??
					false) ||
				false;
		});

		this.genres.forEach((genre) => {
			genre.isSelected =
				(filters.genres?.includes(genre.value || "") ?? false) || false;
		});

		this.versions.forEach((version) => {
			version.isSelected =
				filters.versions?.includes(version.name) || false;
		});

		this.selectedItems = [
			...this.categories.filter((c) => c.isSelected),
			...this.difficulties.filter((d) => d.isSelected),
			...this.genres.filter((g) => g.isSelected),
			...this.versions.filter((v) => v.isSelected),
		];

		this.isSyncingFromService = false;
	}
}
