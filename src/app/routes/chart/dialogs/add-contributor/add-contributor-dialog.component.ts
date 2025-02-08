import { Component, inject, signal } from "@angular/core";

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
	readonly selectedRoles = signal<ContributorRole[]>([]);

	toggleRole(_: MatChipSelectionChange, role: ContributorRole): void {
		this.selectedRoles.update((roles) => {
			const index = roles.indexOf(role);
			if (index < 0) {
				return [...roles, role];
			}

			roles.splice(index, 1);
			return [...roles];
		});
	}

	isRoleSelected(role: ContributorRole): boolean {
		return this.selectedRoles().includes(role);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
