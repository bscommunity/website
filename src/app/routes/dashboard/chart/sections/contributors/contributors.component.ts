import {
	Component,
	computed,
	effect,
	inject,
	input,
	output,
	signal,
} from "@angular/core";

import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { NgGlyph } from "@ng-icons/core";
import { MatButtonModule } from "@angular/material/button";

//Components
import {
	TableComponent,
	TableColumn,
	Action,
} from "../../subcomponents/table/table.component";
import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";

// Dialogs
import { ConfirmationDialogComponent } from "@/components/dialogs/confirmation/confirmation-dialog.component";
import { AddContributorDialogComponent } from "../../dialogs/add-contributor/add-contributor-dialog.component";
import { EditContributorDialogComponent } from "../../dialogs/edit-contributor/edit-contributor-dialog.component";

// Services
import { ContributorService } from "@/services/api/contributor.service";
import { CacheService } from "@/services/cache.service";

// Models
import { ContributorModel } from "@/models/contributor.model";
import { ChartModel } from "@/models/chart.model";
import { SimplifiedUserModel } from "@/models/user.model";
import {
	ContributorRole,
	getContributorRoleLabel,
} from "@/models/enums/role.enum";

interface GroupedContributor {
	user: SimplifiedUserModel;
	roles: ContributorRole[];
	catalogItemId: string;
	joinedAt: Date;
	isOwner: boolean;
}

function groupContributors(list: ContributorModel[]): GroupedContributor[] {
	const userMap = new Map<string, GroupedContributor>();

	for (const c of list) {
		const existing = userMap.get(c.user.id);
		if (existing) {
			existing.roles.push(c.role);
		} else {
			userMap.set(c.user.id, {
				user: c.user,
				roles: [c.role],
				catalogItemId: c.catalogItemId,
				joinedAt: c.joinedAt,
				isOwner: c.role === ContributorRole.AUTHOR,
			});
		}
	}

	return Array.from(userMap.values()).sort((a, b) => {
		if (a.isOwner && !b.isOwner) return -1;
		if (!a.isOwner && b.isOwner) return 1;
		return a.user.username.localeCompare(b.user.username);
	});
}

@Component({
	selector: "app-chart-contributors-section",
	imports: [
		// Modules
		NgGlyph,
		MatButtonModule,
		// Components
		ChartSectionComponent,
		TableComponent,
	],
	templateUrl: "./contributors.component.html",
})
export class ContributorsComponent {
	readonly chartId = input<string>("");
	readonly contributors = input<ContributorModel[] | undefined>([]);
	readonly isOwner = input<boolean>(true);

	readonly contributorsChanged = output<ContributorModel[]>();

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);
	readonly contributorService = inject(ContributorService);
	private cacheService = inject(CacheService);

	/**
	 * Local source of truth for the table. It mirrors the `contributors`
	 * input (which comes from the parent `chart()` signal) but is also
	 * updated immediately after every add/edit/remove so the table,
	 * the add-dialog exclusion list and the parent stay in sync without
	 * a page reload. Direct `TableComponent.removeData()` calls were
	 * removed: mutating the table's internal model while the input
	 * stayed stale caused disabled-button desync and resurrected rows.
	 */
	readonly currentContributors = signal<ContributorModel[]>([]);

	private readonly _contributorsSync = effect(() => {
		this.currentContributors.set(this.contributors() ?? []);
	});

	readonly groupedContributors = computed(() =>
		groupContributors(this.currentContributors()),
	);

	/**
	 * The ContributorService mirrors every mutation into the entity
	 * cache. Re-read the fresh contributors from there, update the
	 * local signal (which refreshes the table via the [data] binding)
	 * and notify the parent so `chart().contributors` doesn't go stale.
	 */
	private syncFromCache(): void {
		const updated = this.cacheService.getEntity<ChartModel>(
			"chart",
			this.chartId(),
		);
		if (!updated) return;
		this.currentContributors.set(updated.contributors ?? []);
		this.contributorsChanged.emit(updated.contributors ?? []);
	}

	openAddContributorConfirmationDialog(): void {
		const dialogRef = this.dialog.open(AddContributorDialogComponent, {
			data: {
				chartId: this.chartId(),
				usersIds: this.currentContributors().map(
					(contributor) => contributor.user.id,
				),
			},
			width: "450px",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (!result) return;
			this.syncFromCache();
		});
	}

	openEditContributorConfirmationDialog(
		_: number,
		contributor: GroupedContributor,
	): void {
		const dialogRef = this.dialog.open(EditContributorDialogComponent, {
			data: {
				chartId: this.chartId(),
				user: contributor.user,
				roles: contributor.roles,
			},
			width: "450px",
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (!result) return;
			this.syncFromCache();
		});
	}

	openRemoveContributorConfirmationDialog(
		_: number,
		contributor: GroupedContributor,
	): void {
		const operation = async () => {
			const result = await this.contributorService.deleteContributor(
				this.chartId(),
				contributor.user.id,
			);

			if (!result) {
				throw new Error("An error occurred");
			}

			this.syncFromCache();
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Contributor",
				description:
					"Are you sure you want to remove this contributor? The user access to the chart will be lost.",
				success: "Contributor removed with success!",
				operation,
			},
		});
	}

	contributorsColumns: TableColumn<GroupedContributor>[] = [
		{
			columnDef: "name",
			header: "Name",
			cell: (item: GroupedContributor) =>
				item.user.avatarUrl
					? `<span class="flex items-center justify-center gap-3"><img class="rounded-full w-5 h-5" src="${item.user.avatarUrl}" alt="${item.user.username}" /> ${item.user.username}<span />`
					: `
					<span class="flex items-center justify-center gap-3 select-none pointer-events-none"><div
						class="rounded-full w-5 h-5 flex items-center justify-center bg-primary-container"
					>
						<span class="text-[10px]">
							${item.user.username.charAt(0)}
						</span>
					</div> ${item.user.username}<span />`,
		},
		{
			columnDef: "roles",
			header: "Roles",
			cell: (item: GroupedContributor) =>
				item.roles.map((r) => getContributorRoleLabel(r)).join(", "),
		},
	];

	contributorsActions: Action<GroupedContributor>[] = [
		{
			description: "Edit",
			icon: "edit",
			callback: this.openEditContributorConfirmationDialog.bind(this),
			disabled: () => false,
		},
		{
			description: "Remove",
			icon: "remove_circle_outline",
			callback: this.openRemoveContributorConfirmationDialog.bind(this),
			disabled: (_, item: GroupedContributor) => item.isOwner,
		},
	];
}
