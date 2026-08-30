import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogContent,
	MatDialogTitle,
	MatDialogRef,
} from "@angular/material/dialog";

import { type DialogData } from "@/services/publish/publish.service";

@Component({
	selector: "app-publish-version-changelog",
	template: `
		<h2 mat-dialog-title>Changelog</h2>
		<mat-dialog-content class="mat-typography flex! flex-col gap-4">
			<p class="mb-2">
				Describe what changed in this version. Supports basic markdown
				formatting.
			</p>
			<textarea
				class="w-full min-h-40 rounded-lg border border-outline bg-surface p-3 text-sm text-on-surface resize-y"
				[(ngModel)]="changelog"
				placeholder="## What's New&#10;- Fixed audio sync issues&#10;- Improved performance&#10;&#10;## Known Issues&#10;- None reported yet"
			></textarea>
		</mat-dialog-content>
		<mat-dialog-actions align="end" class="gap-2">
			<button
				class="w-full md:w-[49%]! mx-0!"
				mat-button
				type="button"
				(click)="dialogRef.close('back')"
			>
				Back
			</button>
			<button
				class="w-full md:w-[49%]! mx-0!"
				mat-flat-button
				type="button"
				(click)="onSubmit()"
			>
				Publish
			</button>
		</mat-dialog-actions>
	`,
	imports: [
		FormsModule,
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent,
		MatDialogActions,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishVersionChangelogComponent {
	readonly dialogRef = inject(MatDialogRef<PublishVersionChangelogComponent>);
	readonly data = inject<DialogData>(MAT_DIALOG_DATA);

	readonly changelog = signal("");

	onSubmit(): void {
		this.dialogRef.close({ changelog: this.changelog() });
	}
}
