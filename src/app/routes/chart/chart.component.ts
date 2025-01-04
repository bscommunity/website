import { Component, inject, signal } from "@angular/core";

import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

import { AsideSectionComponent } from "./subcomponents/aside-section.component";
import { AsideContainerComponent } from "./subcomponents/aside-container.component";
import { ChartSectionComponent } from "./subcomponents/chart-section.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
	TableColumn,
	TableComponent,
} from "./subcomponents/table/table.component";

enum Role {
	CHART = "Chart",
	SYNC = "Sync",
	EFFECTS = "Effects",
	TESTING = "Testing",
}

interface Contributor {
	name: string;
	image_url: string;
	roles: Role[];
}

const CONTRIBUTORS: Contributor[] = [
	{
		name: "kyle421",
		image_url: "https://example.com/kyle421.jpg",
		roles: [Role.CHART, Role.TESTING],
	},
	{
		name: "sarah123",
		image_url: "https://example.com/sarah123.jpg",
		roles: [Role.SYNC],
	},
	{
		name: "james456",
		image_url: "https://example.com/james456.jpg",
		roles: [Role.EFFECTS],
	},
	{
		name: "jane789",
		image_url: "https://example.com/jane789.jpg",
		roles: [Role.CHART],
	},
];

@Component({
	selector: "app-chart",
	imports: [
		NgClass,
		FormsModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule,
		AsideSectionComponent,
		AsideContainerComponent,
		ChartSectionComponent,
		TableComponent,
	],
	templateUrl: "./chart.component.html",
})
export class ChartComponent {
	private _snackBar = inject(MatSnackBar);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	// Set by chart version
	knownIssues = [
		"Incorrect note placed at 03m12s",
		"Unsynchronized section after drop",
		"Wrong direction swipe effect",
	];

	readonly addIssueInputVisible = signal(false);
	newIssue = "";

	cancelAddIssue() {
		this.addIssueInputVisible.set(false);
		this.newIssue = "";
	}

	addIssue() {
		if (this.newIssue.length === 0) {
			this.openSnackBar("Issue cannot be empty", "Close");
			return;
		}

		this.knownIssues.push(this.newIssue);
		this.newIssue = "";
		this.addIssueInputVisible.set(false);
	}

	removeIssue(index: number) {
		this.knownIssues.splice(index, 1);
	}

	contributorsColumns: TableColumn<Contributor>[] = [
		{
			columnDef: "name",
			header: "Name",
			cell: (item: Contributor) => `${item.name}`,
		},
		{
			columnDef: "roles",
			header: "Roles",
			cell: (item: Contributor) => `${item.roles.join(", ")}`,
		},
	];

	contributorsData = CONTRIBUTORS;
}
