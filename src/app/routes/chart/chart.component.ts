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
	Action,
	TableColumn,
	TableComponent,
} from "./subcomponents/table/table.component";

enum Role {
	OWNER = "Owner",
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
		name: "meninocoiso",
		image_url: "https://github.com/theduardomaciel.png",
		roles: [Role.OWNER, Role.CHART, Role.TESTING],
	},
	{
		name: "sarah123",
		image_url: "https://github.com/jamesber.png",
		roles: [Role.SYNC],
	},
	{
		name: "james456",
		image_url: "https://github.com/ocosmo55.png",
		roles: [Role.EFFECTS],
	},
	{
		name: "jane789",
		image_url: "https://github.com/teste123.png",
		roles: [Role.CHART],
	},
];

interface Version {
	id: string;
	publishedAt: Date;
	chart_url: string;
	downloads?: number;
	known_issues: string[];
}

const VERSIONS: Version[] = [
	{
		id: "1.0.0",
		publishedAt: new Date("2021-01-01"),
		chart_url: "https://example.com/1.0.0",
		downloads: 84,
		known_issues: [
			"Incorrect note placed at 03m12s",
			"Unsynchronized section after drop",
			"Wrong direction swipe effect",
		],
	},
	{
		id: "1.1.0",
		publishedAt: new Date("2021-02-01"),
		chart_url: "https://example.com/1.1.0",
		downloads: 221,
		known_issues: [
			"Unsynchronized section after drop",
			"Wrong direction swipe effect",
		],
	},
	{
		id: "1.2.0",
		publishedAt: new Date("2021-03-01"),
		chart_url: "https://example.com/1.2.0",
		downloads: 325,
		known_issues: ["Wrong direction swipe effect"],
	},
];

const lastVersionId = VERSIONS[VERSIONS.length - 1].id;

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
			cell: (item: Contributor) =>
				`<span class="flex items-center justify-center gap-3"><img class="rounded-full w-5 h-5" src="${item.image_url}" alt="${item.name}" /> ${item.name}<span />`,
		},
		{
			columnDef: "roles",
			header: "Roles",
			cell: (item: Contributor) => `${item.roles.join(", ")}`,
		},
	];

	contributorsData = CONTRIBUTORS;

	contributorsActions: Action<Contributor>[] = [
		{
			description: "Remove",
			icon: "remove_circle_outline",
			callback: () => {
				this.openSnackBar("Remove clicked", "Close");
			},
			disabled: (item: Contributor) => item.roles.includes(Role.OWNER),
		},
	];

	versionsColumns: TableColumn<Version>[] = [
		{
			columnDef: "id",
			header: "Version",
			cell: (item: Version) => `${item.id}`,
		},
		{
			columnDef: "publishedAt",
			header: "Published At",
			cell: (item: Version) => `${item.publishedAt.toDateString()}`,
		},
		{
			columnDef: "downloads",
			header: "Downloads",
			cell: (item: Version) => `${item.downloads}`,
		},
	];

	versionsData = VERSIONS;

	versionsActions: Action<Version>[] = [
		{
			description: "Download",
			icon: "download",
			callback: () => {
				this.openSnackBar("Download clicked", "Close");
			},
			disabled: () => false,
		},
		{
			description: "Switch version",
			icon: "swap_horiz",
			callback: () => {
				this.openSnackBar("Switch version clicked", "Close");
			},
			disabled: (item: Version) => item.id === lastVersionId,
		},
		{
			description: "Delete version",
			icon: "delete_forever",
			callback: () => {
				this.openSnackBar("Delete version clicked", "Close");
			},
			disabled: (item: Version) =>
				item.id === "1.0.0" || item.id === lastVersionId,
		},
	];
}
