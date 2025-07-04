import { Component, inject, input, viewChild } from "@angular/core";

import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

//Components
import {
	TableComponent,
	TableColumn,
	Action,
} from "../../subcomponents/table/table.component";
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";

// Dialogs
import { ConfirmationDialogComponent } from "../../dialogs/confirmation/confirmation-dialog.component";
import { AddContributorDialogComponent } from "../../dialogs/add-contributor/add-contributor-dialog.component";
import { EditContributorDialogComponent } from "../../dialogs/edit-contributor/edit-contributor-dialog.component";

// Services
import { ContributorService } from "@/services/api/contributor.service";

// Models
import { ContributorModel } from "@/models/contributor.model";
import {
	ContributorRole,
	getContributorRoleLabel,
} from "@/models/enums/role.enum";

@Component({
	selector: "app-chart-contributors-section",
	imports: [
		// Modules
		MatIconModule,
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

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);
	readonly contributorService = inject(ContributorService);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	readonly contributorTable = viewChild.required<TableComponent<ContributorModel>>("contributorTable");

	openAddContributorConfirmationDialog(): void {
		const contributors = this.contributors();
  this.dialog.open(AddContributorDialogComponent, {
			data: {
				chartId: this.chartId(),
				usersIds: contributors
					? contributors.map(
							(contributor) => contributor.user.id,
						)
					: [],
			},
			width: "450px",
		});
	}

	openEditContributorConfirmationDialog(
		index: number,
		contributor: ContributorModel,
	): void {
		this.dialog.open(EditContributorDialogComponent, {
			data: {
				contributor,
				chartId: this.chartId(),
			},
			width: "450px",
		});
	}

	openRemoveContributorConfirmationDialog(
		_: number,
		contributor: ContributorModel,
	): void {
		console.log("Removing contributor", contributor);

		const operation = async () => {
			const result = await this.contributorService.deleteContributor(
				this.chartId(),
				contributor.user.id,
			);

			if (!result) {
				throw new Error("An error occurred");
			}
		};

		const afterOperation = () => {
			this.removeContributorFromTable(contributor);
			this.openSnackBar("Contributor removed with success!", "Close");
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Contributor",
				description:
					"Are you sure you want to remove this contributor? The user access to the chart will be lost.",
				operation,
				afterOperation,
			},
		});
	}

	contributorsColumns: TableColumn<ContributorModel>[] = [
		{
			columnDef: "name",
			header: "Name",
			cell: (item: ContributorModel) =>
				item.user.imageUrl
					? `<span class="flex items-center justify-center gap-3"><img class="rounded-full w-5 h-5" src="${item.user.imageUrl}" alt="${item.user.username}" /> ${item.user.username}<span />`
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
			cell: (item: ContributorModel) =>
				`${item.roles.map((role) => getContributorRoleLabel(role)).join(", ")}`,
		},
	];

	contributorsActions: Action<ContributorModel>[] = [
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
			disabled: (_, item: ContributorModel) =>
				item.roles.includes(ContributorRole.AUTHOR),
		},
	];

	removeContributorFromTable(contributor: ContributorModel) {
		this.contributorTable().removeData(contributor);
		this.openSnackBar("Contributor removed with success!", "Close");
	}
}
