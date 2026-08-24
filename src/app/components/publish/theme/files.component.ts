import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
	MAT_DIALOG_DATA,
	MatDialogRef,
} from "@angular/material/dialog";

// Components
import {
	THEME_ASSET_FILE_KEYS,
	ThemeAssetFileKey,
	ThemeAssetsFilesFormComponent,
} from "@/components/theme-assets/files-form.component";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import type { ThemeFormData } from "@/services/publish/handlers/theme-publish.handler";

/**
 * Wizard step wrapper around the shared theme asset files form.
 * Translates the shared component's outputs into the wizard's
 * dialog protocol and seeds the form with previously chosen files
 * (so they survive back/forward navigation).
 */
@Component({
	selector: "app-publish-theme-files",
	template: `
		<app-theme-assets-files-form
			[initialValues]="initialValues"
			(back)="dialogRef.close('back')"
			(submitted)="onSubmitted($event)"
		/>
	`,
	imports: [ThemeAssetsFilesFormComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeFilesComponent {
	dialogRef = inject<MatDialogRef<PublishThemeFilesComponent>>(MatDialogRef);
	data = inject<DialogData<ThemeFormData>>(MAT_DIALOG_DATA);

	initialValues: Partial<Record<ThemeAssetFileKey, File>> =
		this.collectInitialValues();

	onSubmitted(value: Record<ThemeAssetFileKey, File | null>): void {
		this.dialogRef.close(value);
	}

	private collectInitialValues(): Partial<Record<ThemeAssetFileKey, File>> {
		const initial: Partial<Record<ThemeAssetFileKey, File>> = {};
		for (const key of THEME_ASSET_FILE_KEYS) {
			const value = this.data.formData?.[
				key as keyof ThemeFormData
			];
			if (value instanceof File) {
				initial[key] = value;
			}
		}
		return initial;
	}
}
