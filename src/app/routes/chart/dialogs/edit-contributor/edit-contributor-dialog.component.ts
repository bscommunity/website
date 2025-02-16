import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
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
		MatProgressSpinnerModule,
		ContributorTagsComponent,
	],
})
export class EditContributorDialogComponent {
	readonly dialogRef = inject(MatDialogRef<EditContributorDialogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly contributor = [this.data.contributor];

	@ViewChild(ContributorTagsComponent)
	tagsComponent!: ContributorTagsComponent;

	hasChanges = signal<boolean>(false);

	constructor(
		private contributorService: ContributorService,
		private cdr: ChangeDetectorRef,
	) {}

	onSubmit(): void {
		const updatedContributors = this.tagsComponent.getUpdatedContributors();

		console.log("Updated contributors:", updatedContributors);

		//this.contributorService.updateContributor()
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
