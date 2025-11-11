import { Component, Input, OnInit, signal, input } from "@angular/core";

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
import { MonthPickerComponent } from "@/components/month-picker/month-picker.component";

// Models
import { Difficulty, getDifficultyLabel } from "@/models/enums/difficulty.enum";
import { Genre, getGenreLabel } from "@/models/enums/genre.enum";

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
		// MonthPickerComponent,
	],
	templateUrl: "./filter-panel.component.html",
})
export class FilterPanelComponent {
	readonly startDate = input<string | null>(null);
	readonly endDate = input<string | null>(null);

	private _difficulties = difficulties;
	private _genres = genres;
	private _versions = versions;

	categories: ExpansionPanelData[] = [
		{ name: "Charts" },
		{ name: "Tourpasses" },
		{ name: "Themes" },
	];

	difficulties: ExpansionPanelData[] = this._difficulties;
	genres: ExpansionPanelData[] = this._genres;
	versions: ExpansionPanelData[] = this._versions;

	readonly datePanelOpenState = signal(false);

	onFilterChange(item: ExpansionPanelData[] | null): void {
		// Change filters here
		console.log(item);
	}
}
