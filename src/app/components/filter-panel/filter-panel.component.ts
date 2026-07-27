import { Component, computed, inject, input } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";

// Components
import {
	ExpansionPanelComponent,
	ExpansionPanelData,
	ExpansionPanelSelectionChange,
} from "@/components/expansion-panel/expansion-panel.component";

// Services
import { FilterService } from "@/services/filter.service";

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
	imports: [ExpansionPanelComponent],
	templateUrl: "./filter-panel.component.html",
})
export class FilterPanelComponent {
	private filterService = inject(FilterService);

	readonly disabled = input<boolean>(false);
	readonly singleCategorySelect = input<boolean>(false);

	private _difficulties = difficulties;
	private _genres = genres;
	private _versions = versions;
	private _categories = categories;
	private readonly toggleHandlers: Record<
		ToggleableFilter,
		(value: string) => void
	> = {
		categories: (val) => this.handleCategoryToggle(val),
		difficulties: (val) => this.filterService.toggleDifficulty(val),
		genres: (val) => this.filterService.toggleGenre(val),
		versions: (val) => this.filterService.toggleVersion(val),
	};
	private readonly filtersSignal = toSignal(this.filterService.filters$, {
		initialValue: this.filterService.getFilters(),
	});

	readonly categories = computed(() =>
		this.withSelection(this._categories, this.filtersSignal().categories),
	);

	readonly showGenres = computed(() => {
		const cats = this.filtersSignal().categories;
		return cats.length === 0 || cats.includes("Charts");
	});

	readonly showDifficulties = computed(() => {
		const cats = this.filtersSignal().categories;
		return cats.length === 0 || cats.includes("Charts") || cats.includes("Tourpasses");
	});

	readonly showVersions = computed(() => {
		const cats = this.filtersSignal().categories;
		return cats.length === 0 || cats.includes("Charts") || cats.includes("Tourpasses");
	});

	readonly difficulties = computed(() =>
		this.withSelection(
			this._difficulties,
			this.filtersSignal().difficulties,
			true,
		),
	);

	readonly genres = computed(() =>
		this.withSelection(this._genres, this.filtersSignal().genres, true),
	);

	readonly versions = computed(() =>
		this.withSelection(this._versions, this.filtersSignal().versions),
	);

	onSelectionChange(
		filter: ToggleableFilter,
		selection: ExpansionPanelSelectionChange,
	): void {
		if (this.disabled()) {
			return;
		}

		const value = this.getOptionValue(filter, selection.item);
		if (!value) {
			return;
		}

		this.toggleHandlers[filter](value);
	}

	/**
	 * Check if there are active filters
	 */
	hasActiveFilters(): boolean {
		return this.filterService.hasActiveFilters();
	}

	clearFilters(): void {
		this.filterService.resetFilters();
	}

	private handleCategoryToggle(value: string): void {
		if (this.singleCategorySelect()) {
			const current = this.filterService.getFilters().categories;
			if (current.length === 1 && current[0] === value) {
				this.filterService.setFilterArray("categories", []);
			} else {
				this.filterService.setFilterArray("categories", [value]);
			}
		} else {
			this.filterService.toggleCategory(value);
		}

		// Clear filters that no longer apply to the selected categories
		const categories = this.filterService.getFilters().categories;
		const hasCharts = categories.length === 0 || categories.includes("Charts");
		const hasChartsOrTourPasses = categories.length === 0 || categories.includes("Charts") || categories.includes("Tourpasses");

		if (!hasCharts) {
			this.filterService.setFilterArray("genres", []);
		}
		if (!hasChartsOrTourPasses) {
			this.filterService.setFilterArray("difficulties", []);
			this.filterService.setFilterArray("versions", []);
		}
	}

	private withSelection(
		options: ExpansionPanelData[],
		selectedValues: readonly string[],
		useValue = false,
	): ExpansionPanelData[] {
		const selection = new Set(selectedValues);
		return options.map((option) => ({
			...option,
			isSelected: selection.has(
				useValue ? (option.value ?? option.name) : option.name,
			),
		}));
	}

	private getOptionValue(
		filter: ToggleableFilter,
		option: ExpansionPanelData,
	): string | undefined {
		if (filter === "categories" || filter === "versions") {
			return option.name;
		}
		return option.value;
	}
}

type ToggleableFilter = "categories" | "difficulties" | "genres" | "versions";
