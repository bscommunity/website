import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
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

// Components
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import {
	MatChipSelectionChange,
	MatChipsModule,
} from "@angular/material/chips";
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Types
import { ContributorModel } from "@/models/contributor.model";
import { ContributorRole } from "@/models/enums/role.enum";

// Services
import { UserService } from "@/services/api/user.service";
import { firstValueFrom } from "rxjs";
import { SimplifiedUserModel, UserModel } from "@/models/user.model";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormControl } from "@angular/forms";
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

	// Roles
	readonly roles = signal(
		Object.values(ContributorRole).filter((r) => r !== "Author"),
	);
	readonly initialData = new Map(
		this.data.contributors.map((c) => [c.user.username, c.roles]),
	);
	readonly selectedRoles = signal<Map<string, ContributorRole[]>>(
		// Initialize a Map with existing contributors and their roles
		this.initialData,
	);

	hasChanges = false;

	toggleRole(
		event: MatChipSelectionChange,
		username: string,
		role: ContributorRole,
	): void {
		const currentMap = new Map(this.selectedRoles()); // Create a new Map from current state
		const userRoles = currentMap.get(username) || [];

		if (event.selected) {
			// Add role if it doesn't exist
			if (!userRoles.includes(role)) {
				currentMap.set(username, [...userRoles, role]);
			}
		} else {
			// Remove role
			currentMap.set(
				username,
				userRoles.filter((r) => r !== role),
			);
		}

		// Check if there are any changes
		this.hasChanges = compareMaps(currentMap, this.initialData) === false;

		this.selectedRoles.set(currentMap);
	}

	isRoleSelected(username: string, role: ContributorRole): boolean {
		const userRoles = this.selectedRoles().get(username) || [];
		return userRoles.includes(role);
	}

	// Contributors Search
	@ViewChild("searchbar") searchbar!: SearchbarComponent;
	queryContributors: SimplifiedUserModel[] | undefined | null = [];

	onSearch(value: string): void {
		console.log(`Novo input: ${value}`);

		if (!this.username) {
			console.error("User not logged in");
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
				this.queryContributors = null;
				this.cdr.detectChanges();
			},
		});
	}

	onOptionSelected(event: MatAutocompleteSelectedEvent): void {
		const username = event.option.viewValue;

		this.searchbar.clearSearch();
		event.option.deselect();

		console.log(`Selected user: ${username}`);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}

function compareMaps(
	map1: Map<string, Array<ContributorRole>>,
	map2: Map<string, Array<ContributorRole>>,
): boolean {
	if (map1.size !== map2.size) return false;

	for (const [key, roles1] of map1) {
		const roles2 = map2.get(key);
		if (!roles2) return false; // Key missing in map2

		if (!compareRoleArrays(roles1, roles2)) return false;
	}

	return true;
}

function compareRoleArrays(
	arr1: ContributorRole[],
	arr2: ContributorRole[],
): boolean {
	if (arr1.length !== arr2.length) return false;

	const set1 = new Set(arr1.map(roleToKey));
	const set2 = new Set(arr2.map(roleToKey));

	return set1.size === set2.size && [...set1].every((key) => set2.has(key));
}

// Convert ContributorRole object to a unique key (for comparison)
function roleToKey(role: ContributorRole): string {
	return role.toString();
}
