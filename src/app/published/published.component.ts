import { Component } from "@angular/core";
import {
	CustomSelectComponent,
	type Option,
} from "../components/custom-select/custom-select.component";
import { MatIconModule } from "@angular/material/icon";
import { FilterPanelComponent } from "./subcomponents/filter-panel/filter-panel.component";
import { ListSectionComponent } from "./subcomponents/list-section.component";
import {
	ChartComponent,
	ChartProps,
	Tendency,
} from "./subcomponents/chart.component";
import { Difficulty } from "@/lib/data";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-published",
	imports: [
		MatIconModule,
		MatButtonModule,
		CustomSelectComponent,
		FilterPanelComponent,
		ListSectionComponent,
		ChartComponent,
	],
	templateUrl: "./published.component.html",
})
export class PublishedComponent {
	sortOptions: Option[] = [
		{
			label: "Newest",
			value: "newest",
		},
		{
			label: "Oldest",
			value: "oldest",
		},
		{
			label: "Most Popular",
			value: "most-popular",
		},
		{
			label: "Least Popular",
			value: "least-popular",
		},
	];

	sortBy: Option = this.sortOptions[0];

	filters = [];

	charts: ChartProps[] = [
		{
			name: "We Live Forever",
			artist: "The Prodigy",
			coverUrl:
				"https://i0.wp.com/lyricsfa.com/wp-content/uploads/2018/10/The-Prodigy-Lyrics.jpg?fit=1000%2C1000&ssl=1",
			duration: 256,
			notesAmount: 325,
			difficulty: Difficulty.Extreme,
			isDeluxe: true,
			ranking: 35,
			tendency: Tendency.Up,
		},
		{
			name: "Flashback",
			artist: "MIYAVI",
			coverUrl:
				"https://th.bing.com/th/id/OIP.sXOr2sC37lJeTDq0xCTf0wAAAA?rs=1&pid=ImgDetMain",
			duration: 180,
			notesAmount: 325,
			difficulty: Difficulty.Extreme,
			isDeluxe: false,
			isExplicit: true,
			ranking: 35,
			tendency: Tendency.Up,
		},
		{
			name: "We Live Forever For The Time",
			artist: "The Prodigy",
			coverUrl:
				"https://i0.wp.com/lyricsfa.com/wp-content/uploads/2018/10/The-Prodigy-Lyrics.jpg?fit=1000%2C1000&ssl=1",
			duration: 256,
			notesAmount: 325,
			difficulty: Difficulty.Extreme,
			isDeluxe: true,
			ranking: 35,
			tendency: Tendency.Up,
		},
	];

	clearFilters() {
		// Clear filters
	}
}
