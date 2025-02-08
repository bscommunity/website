import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from "@angular/core";

import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";

// Types
import { ContributorModel } from "@/models/contributor.model";
import { SearchbarComponent } from "../../../../components/searchbar/searchbar.component";
import { ContributorRole } from "@/models/enums/role.enum";
import {
	MatChipInputEvent,
	MatChipSelectionChange,
	MatChipsModule,
} from "@angular/material/chips";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { AvatarComponent } from "../../../../components/avatar/avatar.component";

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
		ReactiveFormsModule,
		SearchbarComponent,
		AvatarComponent,
	],
})
export class AddContributorDialogComponent {
	readonly dialogRef = inject(MatDialogRef<AddContributorDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly roles = signal(Object.values(ContributorRole));
	readonly selectedRoles = signal<Map<string, ContributorRole[]>>(
		// Initialize a Map with existing contributors and their roles
		new Map(this.data.contributors.map((c) => [c.user.username, c.roles])),
	);

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

		this.selectedRoles.set(currentMap);
	}

	isRoleSelected(username: string, role: ContributorRole): boolean {
		const userRoles = this.selectedRoles().get(username) || [];
		return userRoles.includes(role);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
