import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	signal,
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
	MatChipSelectionChange,
	MatChipsModule,
} from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Types
import { ContributorModel } from "@/models/contributor.model";
import { ContributorRole } from "@/models/enums/role.enum";

// Services
import { UserService } from "@/services/api/user.service";

export interface DialogData {
	contributor: ContributorModel;
}

@Component({
	selector: "app-edit-contributor-dialog",
	templateUrl: "./edit-contributor-dialog.component.html",
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
		AvatarComponent,
	],
})
export class EditContributorDialogComponent {
	readonly dialogRef = inject(MatDialogRef<EditContributorDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	constructor(
		private userService: UserService,
		private cdr: ChangeDetectorRef,
	) {}

	// Roles
	readonly roles = signal(
		Object.values(ContributorRole).filter((r) => r !== "Author"),
	);

	readonly initialRoles = [...this.data.contributor.roles];
	readonly selectedRoles = signal<ContributorRole[]>(this.initialRoles);

	hasChanges = false;

	toggleRole(event: MatChipSelectionChange, role: ContributorRole): void {
		const currentRoles = this.selectedRoles();
		if (event.selected) {
			// Add the role if it's not already selected
			if (!currentRoles.includes(role)) {
				this.selectedRoles.set([...currentRoles, role]);
			}
		} else {
			// Remove the role if it's currently selected
			const updatedRoles = currentRoles.filter((r) => r !== role);
			this.selectedRoles.set(updatedRoles);
		}

		this.hasChanges = !compareRoleArrays(
			this.initialRoles,
			this.selectedRoles(),
		);

		this.cdr.detectChanges();
	}

	isRoleSelected(role: ContributorRole): boolean {
		return this.selectedRoles().includes(role);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
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
