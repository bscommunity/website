import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
	WritableSignal,
} from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogContent,
	MatDialogTitle,
	MatDialogRef,
} from "@angular/material/dialog";

// Components
import { ContributorSearchComponent } from "@/components/contributors/contributor-search/contributor-search.component";
import { ContributorListComponent } from "@/components/contributors/contributor-list/contributor-list.component";

// Models
import {
	ContributorRole,
	CHART_CONTRIBUTOR_ROLES,
} from "@/models/enums/role.enum";
import { SimplifiedUserModel } from "@/models/user.model";
import { SimplifiedContributorModel } from "@/models/contributor.model";

import { type DialogData } from "@/services/publish/publish.service";

interface ContributorsDialogData extends DialogData {
	roles?: ContributorRole[];
}

@Component({
	selector: "app-publish-contributors",
	template: `
		<h2 mat-dialog-title>Add contributors</h2>
		<mat-dialog-content class="mat-typography flex! flex-col gap-4">
			<p class="mb-2">
				Optionally tag creators to credit them for this content. You can
				skip this step and add them later.
			</p>

			<app-contributor-search
				[debounceDuration]="500"
				[existingUserIds]="poolUsers().map((u) => u.id)"
				(userAdded)="onUserAdded($event)"
			/>

			<app-contributor-list
				[users]="poolUsers()"
				[roles]="roles"
				[availableRoles]="availableRoles"
				[canRemove]="true"
				(userRemoved)="removeContributor($event)"
				[emptyMessage]="'No contributors added yet.
Search for users above to add them.'"
			/>
		</mat-dialog-content>
		<mat-dialog-actions align="end" class="gap-2">
			<button
				class="w-full md:w-[32%]! mx-0!"
				mat-button
				type="button"
				(click)="dialogRef.close('back')"
			>
				Back
			</button>
			<button
				class="w-full md:w-[32%]! mx-0!"
				mat-flat-button
				type="button"
				[disabled]="
					poolUsers().length > 0 &&
					!allContributorsHaveAtLeastOneRole()
				"
				(click)="poolUsers().length > 0 ? onSubmit() : onSkip()"
			>
				{{ poolUsers().length > 0 ? "Continue" : "Skip" }}
			</button>
		</mat-dialog-actions>
	`,
	imports: [
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		ContributorSearchComponent,
		ContributorListComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishContributorsComponent {
	readonly dialogRef = inject(MatDialogRef<PublishContributorsComponent>);
	readonly data = inject<ContributorsDialogData>(MAT_DIALOG_DATA);

	readonly poolUsers = signal<SimplifiedUserModel[]>([]);

	readonly roles: WritableSignal<Map<string, ContributorRole[]>> = signal(
		new Map(),
	);

	readonly availableRoles: ContributorRole[] =
		this.data.roles || CHART_CONTRIBUTOR_ROLES;

	allContributorsHaveAtLeastOneRole = computed(
		() => this.roles().size === this.poolUsers().length,
	);

	onUserAdded(user: SimplifiedUserModel): void {
		this.poolUsers.update((users) => [...users, user]);
	}

	removeContributor(id: string): void {
		this.poolUsers.update((users) => users.filter((u) => u.id !== id));
	}

	onSkip(): void {
		this.dialogRef.close("next");
	}

	onSubmit(): void {
		const contributors: SimplifiedContributorModel[] =
			this.poolUsers().flatMap((user) =>
				(this.roles().get(user.id) || []).map((role) => ({
					userId: user.id,
					role,
				})),
			);

		this.dialogRef.close({ contributors });
	}
}
