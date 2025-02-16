import { Component, Input, signal, WritableSignal } from "@angular/core";

// Modules
import {
	MatChipSelectionChange,
	MatChipsModule,
} from "@angular/material/chips";

// Models
import { ContributorRole } from "@/models/enums/role.enum";

@Component({
	selector: "app-contributor-tags",
	imports: [MatChipsModule],
	templateUrl: "./contributor-tags.component.html",
})
export class ContributorTagsComponent {
	@Input() roles!: WritableSignal<Array<ContributorRole>>;

	readonly baseRoles = Object.values(ContributorRole).filter(
		(r) => r !== "Author",
	);

	toggleRole(event: MatChipSelectionChange, role: ContributorRole): void {
		if (event.selected) {
			this.roles.update((roles) => [...roles, role]);
		} else {
			this.roles.update((roles) => roles.filter((r) => r !== role));
		}
	}

	isRoleSelected(role: ContributorRole): boolean {
		return this.roles().some(([, roles]) => roles.includes(role));
	}

	removeContributor(id: string): void {
		this.roles.update((roles) =>
			roles.filter(([contributorId]) => contributorId !== id),
		);
	}
}
