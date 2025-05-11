import {
	ChangeDetectorRef,
	Component,
	inject,
	Input,
	signal,
	WritableSignal,
} from "@angular/core";

// Material
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";
import { ConfirmationDialogComponent } from "../../dialogs/confirmation/confirmation-dialog.component";

// Services
import { KnownIssueService } from "@/services/api/known-issue.service";

// Types
import { KnownIssueModel } from "@/models/known-issue.model";

@Component({
	selector: "app-chart-known-issues-section",
	imports: [
		// Modules
		CommonModule,
		MatIconModule,
		MatTooltipModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		FormsModule,
		// Components
		ChartSectionComponent,
	],
	templateUrl: "./known-issues.component.html",
})
export class KnownIssuesComponent {
	@Input() chartId!: string;
	@Input() issues!: KnownIssueModel[];

	private cdr = inject(ChangeDetectorRef);
	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	readonly knownIssueService = inject(KnownIssueService);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	openRemoveIssueConfirmationDialog(issue: KnownIssueModel): void {
		console.log("Removing issue", issue);

		const operation = async () => {
			const result = await this.knownIssueService.deleteKnownIssue(
				this.chartId,
				issue.id,
			);

			if (!result) {
				throw new Error("An error occurred");
			}
		};

		const afterOperation = () => {
			this.removeIssueFromTable(issue);
			this.dialog.closeAll();
			this.openSnackBar("Issue removed with success!", "Close");
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Issue",
				description:
					"Are you sure you want to remove this issue? It will not appear as solved for other users.",
				operation,
				afterOperation,
			},
		});
	}

	readonly addIssueInputVisible = signal(false);
	isLoading = false;
	newIssue = "";

	cancelAddIssue() {
		this.addIssueInputVisible.set(false);
		this.newIssue = "";
	}

	async addIssue() {
		if (this.newIssue.length === 0) {
			this.openSnackBar("Issue cannot be empty", "Close");
			return;
		}

		this.isLoading = true;

		try {
			// Send issue to the server
			const result = await this.knownIssueService.addIssue(this.chartId, {
				description: this.newIssue,
			});

			if (!result) {
				throw new Error("An error occurred");
			}

			// Add issue to the list
			this.issues = [
				...this.issues,
				{
					id: result.id,
					description: this.newIssue,
					createdAt: new Date(),
				},
			];

			this.cdr.detectChanges();

			// Reset input
			this.newIssue = "";
			this.addIssueInputVisible.set(false);

			this.openSnackBar("Issue added with success!", "Close");

			this.isLoading = false;
		} catch (error) {
			console.error(error);
			this.openSnackBar("An error occurred", "Close");
		}
	}

	removeIssueFromTable(issue: KnownIssueModel) {
		this.issues = this.issues.filter((i) => i.id !== issue.id);
		this.cdr.detectChanges();
	}
}
