import { Component, inject, input } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";
import { DangerZoneListItemComponent } from "@/components/danger-zone-list-item/danger-zone-list-item.component";
import { ConfirmationDialogComponent } from "@/components/dialogs/confirmation/confirmation-dialog.component";
import { DeleteTourPassComponent } from "../../dialogs/delete-tourpass/delete-tourpass.component";

// Services
import { ContributorService } from "@/services/api/contributor.service";

@Component({
	selector: "app-tourpass-danger-zone-section",
	imports: [
		MatDialogModule,
		ChartSectionComponent,
		MatButtonModule,
		DangerZoneListItemComponent,
	],
	templateUrl: "./danger-zone.component.html",
})
export class DangerZoneComponent {
	tourPassId = input.required<string>();
	tourPassName = input.required<string>();
	isOwner = input<boolean>(true);
	isContributor = input<boolean>(false);

	readonly dialog = inject(MatDialog);
	readonly contributorService = inject(ContributorService);
	readonly _snackBar = inject(MatSnackBar);

	noop = () => {};

	openDeleteDialog() {
		this.dialog.open(DeleteTourPassComponent, {
			data: {
				id: this.tourPassId(),
				name: this.tourPassName(),
			},
			disableClose: true,
		});
	}

	openRemoveSelfDialog() {
		const operation = async () => {
			const result =
				await this.contributorService.removeSelfAsContributor(
					this.tourPassId(),
				);

			if (!result) {
				throw new Error("An error occurred");
			}

			window.location.href = "/dashboard/uploads";
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove yourself as contributor",
				description:
					"Are you sure you want to remove yourself as a contributor? You will lose access to this tour pass.",
				success: "Removed as contributor",
				error: "An error occurred while removing you as contributor",
				operation,
			},
		});
	}
}
