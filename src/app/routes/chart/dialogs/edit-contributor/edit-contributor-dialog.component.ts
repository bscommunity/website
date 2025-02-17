import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components

// Types
import { ContributorModel } from "@/models/contributor.model";
import { ContributorRole } from "@/models/enums/role.enum";

// Services
import { UserService } from "@/services/api/user.service";
import { ContributorTagsComponent } from "../../subcomponents/contributor-tags/contributor-tags.component";
import { ContributorService } from "@/services/api/contributor.service";
import { ContributorItemComponent } from "../../subcomponents/contributor-item/contributor-item.component";
import { compareArrays, elementToKey } from "@/lib/compare";
import { Router } from "@angular/router";

export interface DialogData {
	chartId: string;
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
		MatProgressSpinnerModule,
		ContributorItemComponent,
	],
})
export class EditContributorDialogComponent {
	readonly dialogRef = inject(MatDialogRef<EditContributorDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly isLoading = signal(false);

	roles = signal(
		new Map([[this.data.contributor.user.id, this.data.contributor.roles]]),
	);
	isEqual = computed(() =>
		compareArrays(
			this.data.contributor.roles,
			this.roles().get(this.data.contributor.user.id) || [],
			elementToKey,
		),
	);

	constructor(
		private contributorService: ContributorService,
		private router: Router,
		private cdr: ChangeDetectorRef,
	) {}

	async onSubmit(): Promise<void> {
		this.dialogRef.disableClose = true;

		try {
			this.isLoading.update(() => true);
			const response = await this.contributorService.updateContributor(
				this.data.chartId,
				this.data.contributor.user.id,
				this.roles().get(this.data.contributor.user.id) || [],
			);

			// Close the dialog
			this.dialogRef.close();

			// Reload page to update the contributor list
			/* this.router.navigate([this.router.url], {
				onSameUrlNavigation: "reload",
			}); */
			window.location.reload();

			console.log("Updated contributor. Now reloading page...");
		} catch (error) {
			console.error(error);
		}

		this.isLoading.update(() => false);
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
