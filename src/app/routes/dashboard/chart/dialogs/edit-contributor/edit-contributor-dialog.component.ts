import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { ContributorListComponent } from "@/components/contributors/contributor-list/contributor-list.component";

// Models
import { ContributorRole, CHART_CONTRIBUTOR_ROLES } from "@/models/enums/role.enum";
import { SimplifiedUserModel } from "@/models/user.model";

// Services
import { ContributorService } from "@/services/api/contributor.service";

export interface DialogData {
	chartId: string;
	user: SimplifiedUserModel;
	roles: ContributorRole[];
	availableRoles?: ContributorRole[];
}

@Component({
	selector: "app-edit-contributor-dialog",
	templateUrl: "./edit-contributor-dialog.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatProgressSpinnerModule,
		ContributorListComponent,
	],
})
export class EditContributorDialogComponent {
	private contributorService = inject(ContributorService);

	readonly _matSnackBar = inject(MatSnackBar);
	readonly dialogRef = inject(MatDialogRef<EditContributorDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly isLoading = signal(false);
	readonly availableRoles = this.data.availableRoles ?? CHART_CONTRIBUTOR_ROLES;

	readonly roles = signal(
		new Map([[this.data.user.id, [...this.data.roles]]]),
	);

	isEqual = computed(() => {
		const current = this.roles().get(this.data.user.id) || [];
		const original = this.data.roles;
		return (
			current.length === original.length &&
			current.every((r) => original.includes(r))
		);
	});

	async onSubmit(): Promise<void> {
		this.dialogRef.disableClose = true;

		try {
			this.isLoading.update(() => true);

			const selectedRoles = this.roles().get(this.data.user.id) || [];
			await this.contributorService.updateContributor(
				this.data.chartId,
				this.data.user.id,
				selectedRoles,
			);

			this.dialogRef.close();

			window.location.reload();

			console.log("Updated contributor. Now reloading page...");
		} catch (error) {
			console.error(error);
			this._matSnackBar.open("Failed to update contributor", "Close", {
				duration: 3000,
			});
		}

		this.isLoading.update(() => false);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
