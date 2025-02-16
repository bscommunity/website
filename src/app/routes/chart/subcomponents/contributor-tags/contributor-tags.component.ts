import { AvatarComponent } from "@/components/avatar/avatar.component";
import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	signal,
	WritableSignal,
} from "@angular/core";

// Modules
import {
	MatChipSelectionChange,
	MatChipsModule,
} from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";

// Models
import { ContributorRole } from "@/models/enums/role.enum";
import { ContributorModel } from "@/models/contributor.model";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-contributor-tags",
	imports: [
		MatIconModule,
		MatChipsModule,
		MatButtonModule,
		CommonModule,
		AvatarComponent,
	],
	templateUrl: "./contributor-tags.component.html",
})
export class ContributorTagsComponent implements OnInit {
	@Input() canRemove = false;
	@Input() className = "";
	@Input() contributors!: ContributorModel[];

	readonly baseRoles = Object.values(ContributorRole).filter(
		(r) => r !== "Author",
	);
	initialData!: Map<string, Array<ContributorRole>>;
	selectedRoles = signal(new Map<string, Array<ContributorRole>>());

	ngOnInit(): void {
		this.initialData = new Map(
			this.contributors.map((c) => [c.user.username, c.roles]),
		);
		this.selectedRoles.set(this.initialData);
	}

	@Output() hasRolesChanged = new EventEmitter<boolean>();
	@Output() onRemoveContributor = new EventEmitter<string>();

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
		this.hasRolesChanged.emit(
			compareMaps(currentMap, this.initialData) === false,
		);

		this.selectedRoles.set(currentMap);
	}

	isRoleSelected(username: string, role: ContributorRole): boolean {
		const userRoles = this.selectedRoles().get(username) || [];
		return userRoles.includes(role);
	}

	getUpdatedContributors(): ContributorModel[] {
		const updatedContributors: ContributorModel[] = [];

		for (const [username, roles] of this.selectedRoles()) {
			const contributor = this.contributors.find(
				(c) => c.user.username === username,
			);

			if (!contributor) continue;

			updatedContributors.push({
				...contributor,
				roles,
			});
		}

		return updatedContributors;
	}

	removeContributor(id: string): void {
		// Remove
		this.selectedRoles.set(
			new Map(
				[...this.selectedRoles()].filter(
					([username]) => username !== id,
				),
			),
		);

		this.contributors = this.contributors.filter(
			(c) => c.user.username !== id,
		);

		// Emit event to parent component
		this.onRemoveContributor.emit(id);
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
