import {
	ChangeDetectorRef,
	Component,
	inject,
	signal,
	ViewChild,
} from "@angular/core";

import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";

import { ChartSectionComponent } from "./subcomponents/chart-section.component";
import { ConfirmationDialogComponent } from "./dialogs/confirmation/confirmation-dialog.component";
import {
	Action,
	TableColumn,
	TableComponent,
} from "./subcomponents/table/table.component";
import { AsideComponent } from "./subcomponents/aside.component";

enum Role {
	OWNER = "Owner",
	CHART = "Chart",
	SYNC = "Sync",
	EFFECTS = "Effects",
	TESTING = "Testing",
}

interface Contributor {
	id: string;
	name: string;
	image_url: string;
	roles: Role[];
}

const CONTRIBUTORS: Contributor[] = [
	{
		id: "1",
		name: "meninocoiso",
		image_url: "https://github.com/theduardomaciel.png",
		roles: [Role.OWNER, Role.CHART, Role.TESTING],
	},
	{
		id: "2",
		name: "sarah123",
		image_url: "https://github.com/jamesber.png",
		roles: [Role.SYNC],
	},
	{
		id: "3",
		name: "james456",
		image_url: "https://github.com/ocosmo55.png",
		roles: [Role.EFFECTS],
	},
	{
		id: "4",
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
		AsideComponent,
		ChartSectionComponent,
		TableComponent,
	],
	templateUrl: "./chart.component.html",
})
export class ChartComponent {
	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	constructor(private cdr: ChangeDetectorRef) {}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	/* Issues Section */

	knownIssues = [
		"Incorrect note placed at 03m12s",
		"Unsynchronized section after drop",
		"Wrong direction swipe effect",
	];

	openRemoveIssueConfirmationDialog(index: number): void {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Issue",
				description:
					"Are you sure you want to remove this issue? It will not appear as closed for other users.",
			},
		});

		const subscription = dialogRef.afterClosed().subscribe((result) => {
			if (result === "ok") {
				this.removeIssue(index);
				subscription.unsubscribe();
			}
		});
	}

	openCloseIssueConfirmationDialog(index: number): void {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Close Issue",
				description:
					"Are you sure you want to close this issue? It will appear in patch notes as fixed.",
			},
		});

		const subscription = dialogRef.afterClosed().subscribe((result) => {
			if (result === "ok") {
				this.removeIssue(index);
				subscription.unsubscribe();
			}
		});
	}

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

		this.openSnackBar("Issue added with success!", "Close");
	}

	removeIssue(index: number) {
		this.knownIssues.splice(index, 1);
		this.cdr.detectChanges();
		this.openSnackBar("Issue removed with success!", "Close");
	}

	/* Contributors Section */

	@ViewChild("contributorTable")
	contributorTable!: TableComponent<Contributor>;

	openRemoveContributorConfirmationDialog(contributor: Contributor): void {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Contributor",
				description:
					"Are you sure you want to remove this contributor? The user access to the chart will be lost.",
			},
		});

		const subscription = dialogRef.afterClosed().subscribe((result) => {
			if (result === "ok") {
				this.removeContributor(contributor);
				subscription.unsubscribe();
			}
		});
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
			callback: this.openRemoveContributorConfirmationDialog.bind(this),
			disabled: (item: Contributor) => item.roles.includes(Role.OWNER),
		},
	];

	removeContributor(contributor: Contributor) {
		this.contributorTable.removeData(contributor);
		this.openSnackBar("Contributor removed with success!", "Close");
	}

	/* Versions Section */

	@ViewChild("versionTable") versionTable!: TableComponent<Version>;

	openRemoveVersionConfirmationDialog(version: Version): void {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Version",
				description:
					"Are you sure you want to remove this version? It will not be available for download or rollback anymore.",
			},
		});

		const subscription = dialogRef.afterClosed().subscribe((result) => {
			if (result === "ok") {
				this.removeVersion(version);
				subscription.unsubscribe();
			}
		});
	}

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
			callback: this.openRemoveVersionConfirmationDialog.bind(this),
			disabled: (item: Version) =>
				item.id === "1.0.0" || item.id === lastVersionId,
		},
	];

	removeVersion(version: Version) {
		this.versionTable.removeData(version);
		this.openSnackBar("Version removed with success!", "Close");
	}
}
