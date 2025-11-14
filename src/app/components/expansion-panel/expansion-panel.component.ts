import { Component, signal, input, output } from "@angular/core";

import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatSliderModule } from "@angular/material/slider";
import {
	MatChipsModule,
	MatChipSelectionChange,
} from "@angular/material/chips";

export interface ExpansionPanelData {
	name: string;
	value?: string;
	isSelected?: boolean;
}

@Component({
	selector: "app-expansion-panel",
	imports: [
		MatIconModule,
		MatExpansionModule,
		MatSliderModule,
		MatChipsModule,
	],
	templateUrl: "./expansion-panel.component.html",
})
export class ExpansionPanelComponent {
	readonly panelOpenState = signal(false);
	readonly title = input("");
	readonly data = input<ExpansionPanelData[] | null>(null);
	readonly disabled = input<boolean>(false);
	readonly suppressEvents = input<boolean>(false);
	readonly dataChange = output<ExpansionPanelData[] | null>();

	selectionChange(
		event: MatChipSelectionChange,
		item: ExpansionPanelData,
	): void {
		if (this.suppressEvents() || !event.isUserInput) {
			return;
		}
		item.isSelected = event.selected;
		this.dataChange.emit(this.data());
	}
}
