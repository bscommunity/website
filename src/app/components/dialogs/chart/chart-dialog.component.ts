import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

// Material
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatChipsModule } from "@angular/material/chips";

// Types
import { MatIcon } from "@angular/material/icon";

// Components
import { ChartContributorsComponent } from "@/components/chart-contributors/chart-contributors.component";
import { ChartVideoPreviewComponent } from "@/components/chart-video-preview/chart-video-preview.component";

// Models
import { ChartModel } from "@/models/chart.model";

// Libs
import { convertDateTimeToHumanReadable } from "@/lib/time";
import { MatRipple } from "@angular/material/core";

interface ChartDialogData {
	chart: ChartModel;
}

@Component({
	selector: "app-dialog-chart",
	template: `
		<div
			class="flex flex-col items-start justify-start px-9 pt-9 pb-4 md:pb-6 relative"
		>
			<h6 class="mb-2 text-sm font-medium">Chart</h6>
			<h2 class="text-2xl font-bold">
				{{ data.chart.track }}
			</h2>
			<h3 class="text-lg text-on-surface/70">
				{{ data.chart.artist }}
			</h3>

			<button
				class="rounded-full aspect-square flex md:hidden absolute! top-7! right-6! cursor-pointer p-2"
				matRipple
				(click)="dialogRef.close()"
			>
				<mat-icon class=" text-on-surface/70 hover:text-on-surface">
					close
				</mat-icon>
			</button>
		</div>

		<mat-dialog-content
			class="mat-typography flex! flex-col gap-4 md:gap-6"
		>
			@if (
				data.chart.contributors && data.chart.contributors.length > 0
			) {
				<app-chart-contributors
					[contributors]="data.chart.contributors"
					[onClose]="closeDialog"
				></app-chart-contributors>
			}
			<div
				class="flex flex-row items-center justify-center gap-2 h-42 md:h-48"
			>
				<img
					[src]="data.chart.coverUrl"
					alt="Chart Cover"
					class="h-full object-contain rounded-[28px]"
				/>
				<app-chart-video-preview
					class="h-full w-full"
					[audioPreviewUrl]="data.chart.trackPreviewUrl ?? null"
					[previewUrl]="data.chart.latestVersion.previewUrl ?? null"
				></app-chart-video-preview>
			</div>
			<ul class="flex flex-row flex-wrap items-start justify-start gap-2">
				@for (button of buttons; track button.icon) {
					<li
						class="flex items-center justify-center gap-2 pl-2 pr-3 py-1 rounded-lg border border-outline-variant"
					>
						<mat-icon
							inline="true"
							class="text-xl flex items-center justify-center"
						>
							<span class="text-base leading-none">{{
								button.icon
							}}</span>
						</mat-icon>
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
				<mat-icon> share </mat-icon>
				Share
			</a>
			<a
				class="hidden! md:flex! flex-1 w-auto min-h-10 mx-0!"
				tabindex="1"
				mat-flat-button
				(click)="downloadChart()"
				(keypress)="downloadChart()"
			>
				Download
			</a>
			<a
				class="flex! md:hidden! w-full min-h-10 mx-0!"
				tabindex="1"
				mat-flat-button
				href="bscm://chart/{{ data.chart.contentId }}"
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
		MatIcon,
		MatChipsModule,
		ChartContributorsComponent,
		ChartVideoPreviewComponent,
		MatRipple,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartDialogComponent {
	dialogRef = inject<MatDialogRef<ChartDialogComponent>>(MatDialogRef);
	data = inject<ChartDialogData>(MAT_DIALOG_DATA);
	readonly closeDialog = () => this.dialogRef.close();

	private _snackBar = inject(MatSnackBar);

	get buttons() {
		return [
			{
				icon: "timer",
				data: this.formatDuration(
					this.data.chart.latestVersion.duration,
				),
				amount: this.data.chart.latestVersion.duration,
			},
			{
				icon: "music_note",
				data: `${this.data.chart.latestVersion.notesAmount} notes`,
				amount: this.data.chart.latestVersion.notesAmount,
			},
			{
				icon: "blur_on",
				data: `${this.data.chart.latestVersion.effectsAmount} effects`,
				amount: this.data.chart.latestVersion.effectsAmount,
			},
			{
				icon: "download",
				data: `${this.data.chart.latestVersion.downloadsAmount} downloads`,
				amount: this.data.chart.latestVersion.downloadsAmount,
			},
			{
				icon: "calendar_today",
				data: `Updated ${convertDateTimeToHumanReadable(this.data.chart.updatedAt.toString())}`,
				amount: null,
			},
		].filter((button) => button.amount === null || button.amount > 0);
	}

	formatDuration(duration: number) {
		const minutes = Math.floor(duration / 60);
		const seconds = Math.floor(duration % 60);
		return `${minutes}m${seconds}s`;
	}

	downloadChart() {
		window.open(this.data.chart.latestVersion.bundleUrl, "_blank");
		this.dialogRef.close();
	}

	onOpenInApp() {
		// Show a snackbar to ask the user to download the app if not installed
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
		// Generate shareable link
		const url = `${window.location.origin}/link/chart/${this.data.chart.contentId}`;

		// Copy to clipboard
		navigator.clipboard.writeText(url);

		// Show snackbar
		this._snackBar.open("Chart link copied to clipboard!", "Close", {
			duration: 3000,
		});

		this.dialogRef.close();
	}

	onClose() {
		this.dialogRef.close();
	}
}
