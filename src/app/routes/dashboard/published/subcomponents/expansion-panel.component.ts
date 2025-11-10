import { Component, signal, input, output } from "@angular/core";

import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatSliderModule } from "@angular/material/slider";
import { MatChipsModule } from "@angular/material/chips";

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
	template: `
		<mat-expansion-panel
			class="!shadow-none !w-full"
			[expanded]="panelOpenState"
			(opened)="panelOpenState.set(true)"
			(closed)="panelOpenState.set(false)"
		>
			<mat-expansion-panel-header class="!w-full">
				<mat-panel-title> {{ title() }} </mat-panel-title>
			</mat-expansion-panel-header>
			<mat-chip-set [ariaLabel]="title()">
				@for (item of data(); track $index) {
					<mat-chip-option
						[selected]="item.isSelected"
						(selectionChange)="selectionChange(item)"
					>
						{{ item.name }}
					</mat-chip-option>
				}
			</mat-chip-set>
		</mat-expansion-panel>
	`,
})
export class ExpansionPanelComponent {
	readonly panelOpenState = signal(false);
	readonly title = input("");
	readonly data = input<ExpansionPanelData[] | null>(null);
	readonly dataChange = output<ExpansionPanelData[] | null>();

	selectionChange(item: ExpansionPanelData): void {
		item.isSelected = !item.isSelected;
		this.dataChange.emit(this.data());
	}
}
