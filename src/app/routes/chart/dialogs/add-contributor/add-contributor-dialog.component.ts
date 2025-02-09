import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	signal,
	ViewChild,
} from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";
import {
	MatAutocompleteModule,
	MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Types
import { ContributorModel } from "@/models/contributor.model";
import { SimplifiedUserModel } from "@/models/user.model";

// Services
import { UserService } from "@/services/api/user.service";
import { AuthService } from "app/auth/auth.service";

export interface DialogData {
	contributors: ContributorModel[];
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
	],
})
export class AddContributorDialogComponent {
	readonly dialogRef = inject(MatDialogRef<AddContributorDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly username: string | null = null;
	readonly poolContributors: SimplifiedUserModel[] = [];

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private cdr: ChangeDetectorRef,
	) {
		// We need to manually bind the context of the function to the class,
		// if not, UserService will not be available in the function
		this.onSearch = this.onSearch.bind(this);
		this.username = this.authService.user.username;
	}

	// Contributors Search
	@ViewChild("searchbar") searchbar!: SearchbarComponent;
	queryContributors: SimplifiedUserModel[] | undefined | null | "start" =
		"start";

	onSearch(value: string): void {
		console.log(`Novo input: ${value}`);

		if (value.length < 2) {
			this.queryContributors = "start";
			this.cdr.detectChanges();
			return;
		}

		if (!this.username) {
			console.error("User not logged in");
			this.onCancelClick();
			this.authService.logout();
		}

		this.queryContributors = undefined;
		this.cdr.detectChanges();

		this.userService.searchUsers(value).subscribe({
			next: (response) => {
				console.log("Resolved users data:", response);
				this.queryContributors = response.filter(
					(user) => user.username !== this.username,
				);
				this.cdr.detectChanges();
			},
			error: (error) => {
				console.error("Error fetching users:", error);

				if (error.status === 401) {
					console.error("User not logged in");
					this.onCancelClick();
					this.authService.logout();
				}

				this.queryContributors = null;
				this.cdr.detectChanges();
			},
		});
	}

	onOptionSelected(event: MatAutocompleteSelectedEvent): void {
		// Add the user to the pool
		if (this.queryContributors !== "start") {
			this.poolContributors.push(
				this.queryContributors!.find(
					(user) => `@${user.username}` === event.option.viewValue,
				)!,
			);
			console.log("Pool contributors:", this.poolContributors);
		}

		// Reset
		this.searchbar.clearSearch();
		event.option.deselect();
	}

	removeContributor(username: string): void {
		const index = this.poolContributors.findIndex(
			(user) => user.username === username,
		);
		this.poolContributors.splice(index, 1);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
