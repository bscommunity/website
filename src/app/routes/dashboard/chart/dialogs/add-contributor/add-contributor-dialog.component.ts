import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
	WritableSignal,
} from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogTitle,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { ContributorSearchComponent } from "@/components/contributors/contributor-search/contributor-search.component";
import { ContributorListComponent } from "@/components/contributors/contributor-list/contributor-list.component";

// Models
import { ContributorRole, CHART_CONTRIBUTOR_ROLES } from "@/models/enums/role.enum";
import { SimplifiedUserModel } from "@/models/user.model";

// Services
import { ContributorService } from "@/services/api/contributor.service";

export interface DialogData {
	chartId: string;
	usersIds: string[];
}

@Component({
	selector: "app-add-contributor-dialog",
	templateUrl: "./add-contributor-dialog.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatProgressSpinnerModule,
		ContributorSearchComponent,
		ContributorListComponent,
	],
})
export class AddContributorDialogComponent {
	private contributorService = inject(ContributorService);

	readonly _matSnackBar = inject(MatSnackBar);
	readonly dialogRef = inject(MatDialogRef<AddContributorDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly isLoading = signal(false);

	readonly roles: WritableSignal<Map<string, ContributorRole[]>> = signal(
		new Map(),
	);

	readonly availableRoles = CHART_CONTRIBUTOR_ROLES;

	readonly poolUsers = signal<SimplifiedUserModel[]>([]);

	allContributorsHaveAtLeastOneRole = computed(
		() => this.roles().size === this.poolUsers().length,
	);

	readonly searchbarRef = signal<ContributorSearchComponent | null>(null);

	onUserAdded(user: SimplifiedUserModel): void {
		this.poolUsers.update((users) => [...users, user]);
	}

	removeContributor(id: string): void {
		this.poolUsers.update((users) => users.filter((u) => u.id !== id));
	}

	async onSubmit(): Promise<void> {
		this.dialogRef.disableClose = true;

		try {
			this.isLoading.update(() => true);

			await this.contributorService.addContributors(
				this.data.chartId,
				this.poolUsers().flatMap((user) =>
					(this.roles().get(user.id) || []).map((role) => ({
						userId: user.id,
						role,
					})),
				),
			);

			this.dialogRef.close();

			console.log("Contributors added successfully");
		} catch (error) {
			console.error(error);
			this._matSnackBar.open("Failed to add contributors", "Close", {
				duration: 3000,
			});
		}

		this.isLoading.update(() => false);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
