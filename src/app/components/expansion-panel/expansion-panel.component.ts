import { Component, signal, input, output } from "@angular/core";

import { MatExpansionModule } from "@angular/material/expansion";
import {
	MatChipsModule,
	MatChipSelectionChange,
} from "@angular/material/chips";

export interface ExpansionPanelData {
	name: string;
	value?: string;
	isSelected?: boolean;
}

export interface ExpansionPanelSelectionChange {
	item: ExpansionPanelData;
	selected: boolean;
}

@Component({
	selector: "app-expansion-panel",
	imports: [MatExpansionModule, MatChipsModule],
	templateUrl: "./expansion-panel.component.html",
})
export class ExpansionPanelComponent {
	readonly panelOpenState = signal(false);
	readonly title = input("");
	readonly data = input<ExpansionPanelData[] | null>(null);
	readonly disabled = input<boolean>(false);
	readonly optionSelectionChange = output<ExpansionPanelSelectionChange>();

	handleChipSelectionChange(
		event: MatChipSelectionChange,
		item: ExpansionPanelData,
	): void {
		if (this.disabled() || !event.isUserInput) {
			return;
		}
		this.optionSelectionChange.emit({ item, selected: event.selected });
	}
}
