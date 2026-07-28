import { Component, inject, signal, input, model } from "@angular/core";

// Material
import { CommonModule } from "@angular/common";
import { NgGlyph } from "@ng-icons/core";
import { FormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";
import { ConfirmationDialogComponent } from "@/components/dialogs/confirmation/confirmation-dialog.component";

// Services
import { ChangelogService } from "@/services/api/changelog.service";

// Types
import { ChangelogModel } from "@/models/changelog.model";

@Component({
	selector: "app-chart-changelog-section",
	imports: [
		CommonModule,
		NgGlyph,
		MatTooltipModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		FormsModule,
		ChartSectionComponent,
	],
	templateUrl: "./changelog.component.html",
})
export class ChangelogComponent {
	readonly chartId = input.required<string>();
	readonly entries = model.required<ChangelogModel[]>();

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	readonly changelogService = inject(ChangelogService);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	openRemoveEntryConfirmationDialog(entry: ChangelogModel): void {
		console.log("Removing changelog entry", entry);

		const operation = async () => {
			const result = await this.changelogService.deleteEntry(
				this.chartId(),
				entry.id,
			);

			if (!result) {
				throw new Error("An error occurred");
			}

			this.removeEntryFromTable(entry);
		};

		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Remove Entry",
				description:
					"Are you sure you want to remove this changelog entry? It will not appear as solved for other users.",
				success: "Entry removed with success!",
				operation,
			},
		});
	}

	readonly addEntryInputVisible = signal(false);
	isLoading = false;
	newEntry = "";

	cancelAddEntry() {
		this.addEntryInputVisible.set(false);
		this.newEntry = "";
	}

	async addEntry() {
		if (this.newEntry.length === 0) {
			this.openSnackBar("Entry cannot be empty", "Close");
			return;
		}

		this.isLoading = true;

		try {
			const entry = await this.changelogService.addEntry(this.chartId(), {
				description: this.newEntry,
			});

			if (!entry.id) {
				throw new Error("An error occurred");
			}

			this.entries.update((entries) => [
				...entries,
				{
					id: entry.id,
					description: this.newEntry,
					createdAt: new Date(),
				},
			]);

			this.newEntry = "";
			this.addEntryInputVisible.set(false);

			this.openSnackBar("Entry added with success!", "Close");

			this.isLoading = false;
		} catch (error) {
			console.error(error);
			this.openSnackBar("An error occurred", "Close");
		}
	}

	removeEntryFromTable(entry: ChangelogModel) {
		this.entries.update((entries) =>
			entries.filter((e) => e.id !== entry.id),
		);
	}
}
