import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogTitle,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormsModule } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { FileFieldComponent } from "@/components/file-field/file-field.component";

// Services
import { ThemeService } from "@/services/api/theme.service";

// Utils
import { getApiErrorMessage } from "@/models/api-error.model";
import { ErrorDialogComponent } from "@/components/dialogs/error.component";

export interface PublishVersionDialogData {
	themeId: string;
}

@Component({
	selector: "app-publish-theme-version-dialog",
	templateUrl: "./publish-version-dialog.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		FormsModule,
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatFormFieldModule,
		MatInputModule,
		MatProgressSpinnerModule,
		FileFieldComponent,
	],
})
export class PublishVersionDialogComponent {
	private themeService = inject(ThemeService);
	private _snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);

	readonly dialogRef = inject(MatDialogRef<PublishVersionDialogComponent>);
	readonly data = inject<PublishVersionDialogData>(MAT_DIALOG_DATA);

	readonly isLoading = signal(false);

	readonly bundleFile = signal<File | null>(null);
	changelog = "";

	onBundleChanged(file: File): void {
		this.bundleFile.set(file);
	}

	async onSubmit(): Promise<void> {
		const bundleFile = this.bundleFile();
		if (!bundleFile) return;

		this.dialogRef.disableClose = true;
		this.isLoading.set(true);

		try {
			const version = await this.themeService.addThemeVersion(
				this.data.themeId,
				{
					bundleFile,
					changelog: this.changelog,
				},
			);

			this._snackBar.open(
				`Version v${version.versionCode} published with success!`,
				"Close",
				{ duration: 3000 },
			);

			this.dialogRef.close(version);
			window.location.reload();
		} catch (error: unknown) {
			console.error("Failed to publish new version:", error);

			const errorMessage = getApiErrorMessage(
				error,
				"An error occurred while publishing the new version.",
			);

			this.dialogRef.close();
			this.dialog.open(ErrorDialogComponent, {
				data: {
					title: "Failed to publish new version",
					message: errorMessage.message,
					error: errorMessage.error,
				},
			});
		} finally {
			this.isLoading.set(false);
			this.dialogRef.disableClose = false;
		}
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
