import { Component, signal } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatSliderModule } from "@angular/material/slider";
import { MatChipsModule } from "@angular/material/chips";
import {
	ExpansionPanelComponent,
	ExpansionPanelData,
} from "../expansion-panel.component";
import { MonthPickerComponent } from "../month-picker/month-picker.component";
import { Difficulty } from "@/lib/data";

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
	categories: ExpansionPanelData[] = [
		{ name: "Charts" },
		{ name: "Tourpasses" },
		{ name: "Themes" },
	];

	difficulties: ExpansionPanelData[] = Object.values(Difficulty).map(
		(name) => ({
			name,
		}),
	);

	genres: ExpansionPanelData[] = [
		{ name: "Pop" },
		{ name: "Rock" },
		{ name: "Metal" },
		{ name: "Jazz" },
		{ name: "Blues" },
		{ name: "Classical" },
		{ name: "Folk" },
		{ name: "Rap" },
		{ name: "Hip-Hop" },
		{ name: "R&B" },
		{ name: "Dance" },
		{ name: "Soundtrack" },
		{ name: "Latin" },
	];

	versions: ExpansionPanelData[] = [{ name: "Default" }, { name: "Deluxe" }];

	readonly datePanelOpenState = signal(false);

	onFilterChange(item: ExpansionPanelData[] | null): void {
		// Change filters here
		console.log(item);
	}
}
