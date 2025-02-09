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

// Components
import { ChartSectionComponent } from "../../subcomponents/chart-section.component";
import { ConfirmationDialogComponent } from "../../dialogs/confirmation/confirmation-dialog.component";

// Types
import { KnownIssueModel } from "@/models/known-issue.model";

@Component({
	selector: "app-chart-known-issues-section",
	imports: [
		// Modules
		CommonModule,
		MatIconModule,
		MatButtonModule,
		FormsModule,
		// Components
		ChartSectionComponent,
	],
	templateUrl: "./known-issues.component.html",
})
export class KnownIssuesComponent {
	@Input() initialKnownIssues: KnownIssueModel[] = [];
	knownIssues: WritableSignal<KnownIssueModel[]> = signal(
		this.initialKnownIssues,
	);

	constructor(private cdr: ChangeDetectorRef) {}

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	openRemoveIssueConfirmationDialog(index: number): void {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Issue",
				description:
					"Are you sure you want to remove this issue? It will not appear as closed for other users.",
			},
		});

		const subscription = dialogRef.afterClosed().subscribe((result) => {
			if (result === "ok") {
				this.removeIssue(index);
				subscription.unsubscribe();
			}
		});
	}

	openCloseIssueConfirmationDialog(index: number): void {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Close Issue",
				description:
					"Are you sure you want to close this issue? It will appear in patch notes as fixed.",
			},
		});

		const subscription = dialogRef.afterClosed().subscribe((result) => {
			if (result === "ok") {
				this.removeIssue(index);
				subscription.unsubscribe();
			}
		});
	}

	readonly addIssueInputVisible = signal(false);
	newIssue = "";

	cancelAddIssue() {
		this.addIssueInputVisible.set(false);
		this.newIssue = "";
	}

	addIssue() {
		if (this.newIssue.length === 0) {
			this.openSnackBar("Issue cannot be empty", "Close");
			return;
		}

		this.knownIssues.update((issues) => [
			...issues,
			{
				description: this.newIssue,
				index: issues.length,
				createdAt: new Date(),
			},
		]);

		// Reset input
		this.newIssue = "";
		this.addIssueInputVisible.set(false);

		this.openSnackBar("Issue added with success!", "Close");
	}

	removeIssue(index: number) {
		this.knownIssues.update((issues) =>
			issues.filter((issue) => issue.index !== index),
		);
		this.cdr.detectChanges();

		this.openSnackBar("Issue removed with success!", "Close");
	}
}
