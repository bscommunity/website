import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	inject,
	signal,
	ViewChild,
	WritableSignal,
} from "@angular/core";

// Material
import {
	MatAutocompleteModule,
	MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { ContributorItemComponent } from "../../subcomponents/contributor-item/contributor-item.component";

// Models
import { ContributorModel } from "@/models/contributor.model";
import { ContributorRole } from "@/models/enums/role.enum";
import { SimplifiedUserModel } from "@/models/user.model";

// Services
import { ContributorService } from "@/services/api/contributor.service";
import { UserService } from "@/services/api/user.service";
import { AuthService } from "app/auth/auth.service";

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
		MatIconModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatChipsModule,
		MatProgressSpinnerModule,
		MatAutocompleteModule,
		SearchbarComponent,
		AvatarComponent,
		ContributorItemComponent,
	],
})
export class AddContributorDialogComponent {
	readonly dialogRef = inject(MatDialogRef<AddContributorDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly isLoading = signal(false);

	readonly username: string | null = null;

	readonly roles: WritableSignal<Map<string, ContributorRole[]>> = signal(
		new Map(),
	);

	allContributorsHaveAtLeastOneRole = computed(
		() => this.roles().size === this.poolUsers.length,
	);

	readonly poolUsers: SimplifiedUserModel[] = [];

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private contributorService: ContributorService,
		private cdr: ChangeDetectorRef,
	) {
		// We need to manually bind the context of the function to the class,
		// if not, UserService will not be available in the function
		this.onSearch = this.onSearch.bind(this);

		this.roles();

		// Get the username of the logged in user
		this.username = this.authService.user.username;
	}

	// Contributors Search
	@ViewChild("searchbar") searchbar!: SearchbarComponent;
	queryContributors: SimplifiedUserModel[] | undefined | null | "start" =
		"start";

	onSearch(value: string): void {
		// If the input is too short, don't query the server
		if (value.length < 2) {
			this.queryContributors = "start";
			this.cdr.detectChanges();
			return;
		}

		// If the user is not logged in, log them out
		if (!this.username) {
			console.error("User not logged in");
			this.onCancelClick();
			this.authService.logout();
		}

		// Fetch the users
		this.queryContributors = undefined;
		this.cdr.detectChanges();

		this.userService.searchUsers(value).subscribe({
			next: (response) => {
				// console.log("Resolved users data:", response);
				this.queryContributors = response.filter(
					(user) =>
						// The user is not the logged in user
						user.username !== this.username &&
						// The user is not already in the pool
						!this.poolUsers.some(
							(poolUser) => poolUser.id === user.id,
						) &&
						// The user is not already in the chart
						!this.data.usersIds.includes(user.id),
				);
				this.cdr.detectChanges();
			},
			error: (error) => {
				console.error("Error fetching users:", error);

				this.queryContributors = null;
				this.cdr.detectChanges();
			},
		});
	}

	onOptionSelected(event: MatAutocompleteSelectedEvent): void {
		// Add the user to the pool
		if (this.queryContributors !== "start") {
			const user = this.queryContributors!.find(
				(user) => `@${user.username}` === event.option.viewValue,
			);

			if (!user) {
				console.error("User not found");
				return;
			}

			this.poolUsers.push(user);
			this.queryContributors = "start";
		}

		// Reset
		this.searchbar.clearSearch();
		event.option.deselect();
	}

	removeContributor(id: string): void {
		const index = this.poolUsers.findIndex((user) => user.id === id);
		if (index === -1) {
			console.error("User not found");
			return;
		}

		this.poolUsers.splice(index, 1);
	}

	async onSubmit(): Promise<void> {
		this.dialogRef.disableClose = true;

		try {
			this.isLoading.update(() => true);

			await this.contributorService.addContributors(
				this.data.chartId,
				this.poolUsers.map((user) => ({
					userId: user.id,
					roles: this.roles().get(user.id) || [],
				})),
			);

			// Close the dialog
			this.dialogRef.close();

			// Reload page to update the contributor list
			/* this.router.navigate([this.router.url], {
				onSameUrlNavigation: "reload",
			}); */
			/* window.location.reload(); */

			console.log("Contributors added successfully");
		} catch (error) {
			console.error(error);
		}

		this.isLoading.update(() => false);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
