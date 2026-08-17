import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";

// Material
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

// Models
import type { ThemeModel } from "@/models/theme.model";

@Component({
	selector: "app-publish-theme-success",
	template: `
		<h2 mat-dialog-title>Success!</h2>
		<mat-dialog-content class="mat-typography flex! flex-col gap-4">
			<p>Your theme was submitted successfully.</p>
			<div class="flex items-center gap-4">
				@if (data.coverUrl) {
					<img
						[src]="data.coverUrl"
						[alt]="data.name"
						class="w-16 h-16 rounded-lg object-cover"
					/>
				}
				<div class="flex flex-col">
					<p class="text-base font-semibold">{{ data.name }}</p>
					<p class="text-sm text-on-surface-variant">
						Replaces: {{ data.replaces }}
					</p>
				</div>
			</div>
		</mat-dialog-content>
		<mat-dialog-actions align="center">
			<button
				class="!w-full !mb-3"
				mat-flat-button
				(click)="onAccessButtonClicked()"
			>
				Access theme
			</button>
		</mat-dialog-actions>
	`,
	imports: [MatDialogModule, MatButtonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishThemeSuccessComponent {
	dialogRef =
		inject<MatDialogRef<PublishThemeSuccessComponent>>(MatDialogRef);
	data = inject<ThemeModel>(MAT_DIALOG_DATA);
	private router = inject(Router);

	onAccessButtonClicked() {
		this.dialogRef.close();
		this.router.navigate([`dashboard/theme/${this.data.id}`]);
	}
}
