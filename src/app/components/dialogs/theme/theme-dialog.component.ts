import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

// Material
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ShareService } from "@/services/share.service";

// Icons
import { NgGlyph } from "@ng-icons/core";
import { MatRipple } from "@angular/material/core";

// Components
import { ThemeArtComponent } from "@/components/theme-preview/art/theme-art.component";

// Models
import type { ThemeModel } from "@/models/theme.model";
import { getBeatstarThemeName } from "@/models/theme/theme-genres";
import { convertDateTimeToHumanReadable } from "@/lib/time";

interface ThemeDialogData {
	theme: ThemeModel;
}

@Component({
	selector: "app-dialog-theme",
	template: `
		<div
			class="flex flex-col items-start justify-start px-9 pt-9 pb-4 md:pb-6 relative"
		>
			<h6 class="mb-2 text-sm font-medium">Theme</h6>
			<h2 class="text-2xl font-bold">
				{{ data.theme.name }}
			</h2>

			<button
				class="rounded-full aspect-square flex md:hidden absolute! top-7! right-6! cursor-pointer p-2"
				matRipple
				(click)="dialogRef.close()"
			>
				<ng-glyph name="close" class="text-on-surface/70 hover:text-on-surface" />
			</button>
		</div>

		<mat-dialog-content
			class="mat-typography flex! flex-col gap-4 md:gap-6"
		>
			<div class="flex items-center justify-center">
				<app-theme-art [theme]="data.theme" />
			</div>

			<ul class="flex flex-row flex-wrap items-start justify-start gap-2">
				@for (button of buttons; track button.icon) {
					<li
						class="flex items-center justify-center gap-2 pl-2 pr-3 py-1 rounded-lg border border-outline-variant"
					>
						<ng-glyph
							[name]="button.icon"
							size="16"
							class="leading-none"
						/>
						<span class="mt-0.5 font-medium text-sm leading-none">
							{{ button.data }}
						</span>
					</li>
				}
			</ul>
		</mat-dialog-content>
		<mat-dialog-actions
			class="flex! flex-col md:flex-row! gap-2 w-full items-stretch"
		>
			<a
				tabindex="0"
				mat-stroked-button
				class="flex-1 w-full md:w-auto min-h-10 mx-0!"
				(click)="onShare()"
				(keypress)="onShare()"
			>
				<ng-glyph name="share" />
				Share
			</a>
			<a
				class="flex! md:hidden! w-full min-h-10 mx-0!"
				tabindex="1"
				mat-flat-button
				(click)="onOpenInApp()"
				(keypress)="onOpenInApp()"
			>
				Open in app
			</a>
		</mat-dialog-actions>
	`,
	imports: [
		MatDialogModule,
		MatButtonModule,
		NgGlyph,
		MatRipple,
		ThemeArtComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeDialogComponent {
	dialogRef = inject<MatDialogRef<ThemeDialogComponent>>(MatDialogRef);
	data = inject<ThemeDialogData>(MAT_DIALOG_DATA);

	private _snackBar = inject(MatSnackBar);
	private shareService = inject(ShareService);

	readonly replacesName: string =
		getBeatstarThemeName(this.data.theme.replaces) ?? this.data.theme.replaces;

	get buttons() {
		return [
			{
				icon: "palette",
				data: `Replaces ${this.replacesName}`,
			},
			{
				icon: "download",
				data: `${this.data.theme.downloadsSum} downloads`,
			},
			{
				icon: "calendar_today",
				data: `Updated ${convertDateTimeToHumanReadable(this.data.theme.updatedAt?.toString() ?? "")}`,
			},
		];
	}

	onOpenInApp() {
		const action = this._snackBar.open(
			"If the app is not installed, you can download it here.",
			"Download app",
			{
				duration: 5000,
			},
		);

		action.onAction().subscribe(() => {
			window.open("https://bscm.netlify.app/download", "_blank");
		});

		this.dialogRef.close();
	}

	onShare() {
		const url = `${window.location.origin}/link/theme/${this.data.theme.id}`;
		this.shareService.share(url);
		this.dialogRef.close();
	}
}
