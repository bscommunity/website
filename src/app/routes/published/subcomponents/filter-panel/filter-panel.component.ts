import { Component, Input, OnInit, signal } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatSliderModule } from "@angular/material/slider";
import { MatChipsModule } from "@angular/material/chips";
import {
	ExpansionPanelComponent,
	ExpansionPanelData,
} from "../expansion-panel.component";
import { MonthPickerComponent } from "../month-picker/month-picker.component";
import { Difficulty, getDifficultyLabel } from "@/models/enums/difficulty.enum";
import { Genre, getGenreLabel } from "@/models/enums/genre.enum";
import { ChartModel } from "@/models/chart.model";
import { VersionModel } from "@/models/version.model";

const difficulties: ExpansionPanelData[] = Object.values(Difficulty).map(
	(name) => ({
		name: getDifficultyLabel(name as Difficulty),
		value: name,
	}),
);

const genres: ExpansionPanelData[] = Object.values(Genre).map((name) => ({
	name: getGenreLabel(name as Genre),
	value: name,
}));

const versions: ExpansionPanelData[] = [
	{ name: "Default" },
	{ name: "Deluxe" },
];

@Component({
	selector: "app-filter-panel",
	imports: [
		MatIconModule,
		MatExpansionModule,
		MatSliderModule,
		MatChipsModule,
		ExpansionPanelComponent,
		MonthPickerComponent,
	],
	templateUrl: "./filter-panel.component.html",
})
export class FilterPanelComponent {
	@Input() startDate: string | null = null;
	@Input() endDate: string | null = null;

	private _difficulties: Difficulty[] = [];
	private _genres: (Genre | undefined)[] = [];
	private _versions: string[] = [];

	@Input()
	set availableDifficulties(value: Difficulty[]) {
		this._difficulties = value;
		this.updateDifficulties(value);
	}
	get availableDifficulties(): Difficulty[] {
		return this._difficulties;
	}

	@Input()
	set availableGenres(value: (Genre | undefined)[]) {
		this._genres = value;
		this.updateGenres(value);
	}
	get availableGenres(): (Genre | undefined)[] {
		return this._genres;
	}

	@Input()
	set availableVersions(value: string[]) {
		this._versions = value;
		this.updateVersions(value);
	}
	get availableVersions(): string[] {
		return this._versions;
	}

	categories: ExpansionPanelData[] = [
		{ name: "Charts" },
		{ name: "Tourpasses" },
		{ name: "Themes" },
	];

	difficulties: ExpansionPanelData[] = [];
	genres: ExpansionPanelData[] = [];
	versions: ExpansionPanelData[] = [];

	private updateDifficulties(value: Difficulty[]) {
		console.log("Updating difficulties with:", value);
		this.difficulties = value.map((difficulty) => ({
			name: getDifficultyLabel(difficulty),
			value: difficulty,
		}));
		console.log("Updated difficulties:", this.difficulties);
	}

	private updateGenres(value: (Genre | undefined)[]) {
		console.log("Updating genres with:", value);
		this.genres = value.map((genre) => ({
			name: getGenreLabel(genre as Genre),
			value: genre,
		}));
		console.log("Updated genres:", this.genres);
	}

	private updateVersions(value: string[]) {
		console.log("Updating versions with:", value);
		this.versions = value.map((version) => ({
			name: version,
			value: version,
		}));
		console.log("Updated versions:", this.versions);
	}

	readonly datePanelOpenState = signal(false);

	onFilterChange(item: ExpansionPanelData[] | null): void {
		// Change filters here
		console.log(item);
	}
}
