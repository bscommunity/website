import { Component, WritableSignal, input } from "@angular/core";
import {
	MatChipSelectionChange,
	MatChipsModule,
} from "@angular/material/chips";
import {
	ContributorRole,
	getContributorRoleLabel,
} from "@/models/enums/role.enum";

@Component({
	selector: "app-contributor-tags",
	standalone: true,
	imports: [MatChipsModule],
	templateUrl: "./contributor-tags.component.html",
})
export class ContributorTagsComponent {
	readonly getRoleLabel = getContributorRoleLabel;

	readonly userId = input.required<string>();
	readonly roles =
		input.required<WritableSignal<Map<string, ContributorRole[]>>>();
	readonly availableRoles = input.required<ContributorRole[]>();
	readonly disabled = input(false);

	toggleRole(event: MatChipSelectionChange, role: ContributorRole): void {
		const signal = this.roles();
		const currentRoles = signal().get(this.userId()) || [];
		let newRoles: ContributorRole[];

		if (event.selected) {
			newRoles = currentRoles.includes(role)
				? currentRoles
				: [...currentRoles, role];
		} else {
			newRoles = currentRoles.filter((r: ContributorRole) => r !== role);
		}

		const next = new Map(signal());
		if (newRoles.length > 0) {
			next.set(this.userId(), newRoles);
		} else {
			next.delete(this.userId());
		}

		signal.set(next);
	}

	isRoleSelected(role: ContributorRole): boolean {
		const userRoles = this.roles()().get(this.userId());
		return userRoles ? userRoles.includes(role) : false;
	}

	removeContributor(): void {
		const signal = this.roles();
		const next = new Map(signal());
		next.delete(this.userId());
		signal.set(next);
	}
}
