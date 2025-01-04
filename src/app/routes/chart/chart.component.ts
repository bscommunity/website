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
		downloads: 100,
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
		downloads: 200,
		known_issues: [
			"Unsynchronized section after drop",
			"Wrong direction swipe effect",
		],
	},
	{
		id: "1.2.0",
		publishedAt: new Date("2021-03-01"),
		chart_url: "https://example.com/1.2.0",
		downloads: 300,
		known_issues: ["Wrong direction swipe effect"],
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

	contributorsActions: Action<Contributor>[] = [
		{
			description: "View profile",
			icon: "visibility",
			callback: () => {
				this.openSnackBar("View profile clicked", "Close");
			},
		},
		{
			description: "Send message",
			icon: "message",
			callback: () => {
				this.openSnackBar("Send message clicked", "Close");
			},
		},
		{
			description: "Remove",
			icon: "delete",
			callback: () => {
				this.openSnackBar("Remove clicked", "Close");
			},
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
			description: "View chart",
			icon: "visibility",
			callback: () => {
				this.openSnackBar("View chart clicked", "Close");
			},
		},
		{
			description: "Download",
			icon: "download",
			callback: () => {
				this.openSnackBar("Download clicked", "Close");
			},
		},
		{
			description: "Report issue",
			icon: "report",
			callback: () => {
				this.openSnackBar("Report issue clicked", "Close");
			},
		},
	];
}
