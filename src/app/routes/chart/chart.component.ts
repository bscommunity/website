import {
	ChangeDetectorRef,
	Component,
	inject,
	OnInit,
	signal,
	ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";

// Components
import { ChartSectionComponent } from "./subcomponents/chart-section.component";
import { ConfirmationDialogComponent } from "./dialogs/confirmation/confirmation-dialog.component";
import {
	Action,
	TableColumn,
	TableComponent,
} from "./subcomponents/table/table.component";
import { AsideComponent } from "./subcomponents/aside.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { ContributorModel } from "@/models/contributor.model";
import { VersionModel } from "@/models/version.model";
import { Role } from "@/models/enums/role.enum";

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
export class ChartComponent implements OnInit {
	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	constructor(
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
	) {}

	chart: ChartModel | null = null;
	latestVersion: VersionModel | undefined = undefined;

	ngOnInit(): void {
		// Access resolved data
		this.chart = this.route.snapshot.data["chart"];
		// console.log("Resolved Chart Data:", this.chart);

		this.latestVersion = this.chart?.versions.at(-1);

		console.log("Latest Version:", this.latestVersion?.publishedAt);
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	/* Issues Section */

	// Get the latest version known issues
	knownIssues = this.latestVersion?.knownIssues ?? [];

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

		this.chart?.versions.at(-1)?.knownIssues.push({
			description: this.newIssue,
			index: this.chart.versions.length,
			createdAt: new Date(),
		});
		this.newIssue = "";
		this.addIssueInputVisible.set(false);

		this.openSnackBar("Issue added with success!", "Close");
	}

	removeIssue(index: number) {
		this.chart?.versions.at(-1)?.knownIssues.splice(index, 1);
		this.cdr.detectChanges();
		this.openSnackBar("Issue removed with success!", "Close");
	}

	/* Contributors Section */

	@ViewChild("contributorTable")
	contributorTable!: TableComponent<ContributorModel>;

	openRemoveContributorConfirmationDialog(
		contributor: ContributorModel,
	): void {
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

	contributorsColumns: TableColumn<ContributorModel>[] = [
		{
			columnDef: "name",
			header: "Name",
			cell: (item: ContributorModel) =>
				`<span class="flex items-center justify-center gap-3"><img class="rounded-full w-5 h-5" src="${item.user.imageUrl}" alt="${item.user.username}" /> ${item.user.username}<span />`,
		},
		{
			columnDef: "roles",
			header: "Roles",
			cell: (item: ContributorModel) => `${item.roles.join(", ")}`,
		},
	];

	contributorsActions: Action<ContributorModel>[] = [
		{
			description: "Remove",
			icon: "remove_circle_outline",
			callback: this.openRemoveContributorConfirmationDialog.bind(this),
			disabled: (item: ContributorModel) =>
				item.roles.includes(Role.AUTHOR),
		},
	];

	removeContributor(contributor: ContributorModel) {
		this.contributorTable.removeData(contributor);
		this.openSnackBar("Contributor removed with success!", "Close");
	}

	/* Versions Section */

	@ViewChild("versionTable") versionTable!: TableComponent<VersionModel>;

	openRemoveVersionConfirmationDialog(version: VersionModel): void {
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

	versionsColumns: TableColumn<VersionModel>[] = [
		{
			columnDef: "id",
			header: "Version",
			cell: (item: VersionModel) => `${item.index}`,
		},
		{
			columnDef: "publishedAt",
			header: "Published At",
			cell: (item: VersionModel) => `${item.publishedAt.toDateString()}`,
		},
		{
			columnDef: "downloads",
			header: "Downloads",
			cell: (item: VersionModel) => `${item.downloadsAmount ?? 0}`,
		},
	];

	lastVersionId = this.chart?.versions[this.chart?.versions.length - 1].index;

	versionsActions: Action<VersionModel>[] = [
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
			disabled: (item: VersionModel) => item.index === this.lastVersionId,
		},
		{
			description: "Delete version",
			icon: "delete_forever",
			callback: this.openRemoveVersionConfirmationDialog.bind(this),
			disabled: (item: VersionModel) =>
				item.index === 1 || item.index === this.lastVersionId,
		},
	];

	removeVersion(version: VersionModel) {
		this.versionTable.removeData(version);
		this.openSnackBar("Version removed with success!", "Close");
	}
}
