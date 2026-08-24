import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

// Components
import { ThemeAssetsBatchUploadComponent } from "@/components/theme-assets/batch-upload.component";

/**
 * Wizard step wrapper around the shared theme asset batch upload.
 * Translates the shared component's outputs into the wizard's
 * dialog protocol ("back" / "next" / form data result).
 */
@Component({
	selector: "app-publish-theme-batch-files",
	template: `
		<app-theme-assets-batch-upload
			(canceled)="dialogRef.close('back')"
			(skipped)="dialogRef.close('next')"
			(filesSelected)="onFilesSelected($event)"
		/>
	`,
	imports: [ThemeAssetsBatchUploadComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeBatchFilesComponent {
	readonly dialogRef =
		inject<MatDialogRef<PublishThemeBatchFilesComponent>>(MatDialogRef);

	onFilesSelected(files: Record<string, File>): void {
		// Flag used by the wizard to skip the individual files step
		this.dialogRef.close({ ...files, assetsFromBatch: true });
	}
}
