import { Component, Input, WritableSignal } from "@angular/core";
import {
	MatChipSelectionChange,
	MatChipsModule,
} from "@angular/material/chips";
import { ContributorRole } from "@/models/enums/role.enum";

@Component({
	selector: "app-contributor-tags",
	standalone: true,
	imports: [MatChipsModule],
	templateUrl: "./contributor-tags.component.html",
})
export class ContributorTagsComponent {
	@Input() userId!: string;
	@Input() roles!: WritableSignal<Map<string, Array<ContributorRole>>>;

	readonly baseRoles = Object.values(ContributorRole).filter(
		(r) => r !== "AUTHOR",
	);

	toggleRole(event: MatChipSelectionChange, role: ContributorRole): void {
		this.roles.update((rolesMap) => {
			// Get current roles or default to an empty array.
			const currentRoles = rolesMap.get(this.userId) || [];
			let newRoles: ContributorRole[];

			if (event.selected) {
				// Add the role if it's not already there.
				if (!currentRoles.includes(role)) {
					newRoles = [...currentRoles, role];
				} else {
					newRoles = currentRoles;
				}
			} else {
				// Remove the role.
				newRoles = currentRoles.filter((r) => r !== role);
			}

			// Update the map: if no roles remain, remove the key.
			if (newRoles.length > 0) {
				rolesMap.set(this.userId, newRoles);
			} else {
				rolesMap.delete(this.userId);
			}

			// Return a new Map to trigger Angular's change detection.
			return new Map(rolesMap);
		});
	}

	isRoleSelected(role: ContributorRole): boolean {
		const userRoles = this.roles().get(this.userId);
		return userRoles ? userRoles.includes(role) : false;
	}

	removeContributor(): void {
		this.roles.update((rolesMap) => {
			rolesMap.delete(this.userId);
			return new Map(rolesMap);
		});
	}
}
