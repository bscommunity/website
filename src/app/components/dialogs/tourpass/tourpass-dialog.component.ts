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
import { Router } from "@angular/router";

// Icons
import { NgGlyph } from "@ng-icons/core";

// Models
import { TourPassModel } from "@/models/tour-pass.model";
import { convertDateTimeToHumanReadable } from "@/lib/time";
import { MatRipple } from "@angular/material/core";

interface TourPassDialogData {
	tourpass: TourPassModel;
}

@Component({
	selector: "app-dialog-tourpass",
	template: `
		<div
			class="flex flex-col items-start justify-start px-9 pt-9 pb-4 md:pb-6 relative"
		>
			<h6 class="mb-2 text-sm font-medium">Tour Pass</h6>
			<h2 class="text-2xl font-bold">
				{{ data.tourpass.name }}
			</h2>
			@if (data.tourpass.artist) {
				<h3 class="text-lg text-on-surface/70">
					{{ data.tourpass.artist }}
				</h3>
			}

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
			@if (data.tourpass.description) {
				<p class="text-on-surface/80">{{ data.tourpass.description }}</p>
			}

			@if (data.tourpass.coverUrl) {
				<div class="flex items-center justify-center">
					<img
						[src]="data.tourpass.coverUrl"
						alt="Tour Pass Cover"
						class="max-h-48 object-contain rounded-2xl"
					/>
				</div>
			}

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

			@if (data.tourpass.charts && data.tourpass.charts.length > 0) {
				<div class="flex flex-col gap-2">
					<h5 class="text-sm font-medium text-on-surface/70">Setlist</h5>
					<div class="flex flex-col gap-2 max-h-60 overflow-y-auto">
						@for (chart of data.tourpass.charts; track chart.id) {
							<div
								class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container cursor-pointer"
								(click)="openChart(chart.id)"
								(keypress)="openChart(chart.id)"
								tabindex="0"
							>
								@if (chart.track.coverUrl) {
									<img
										[src]="chart.track.coverUrl"
										alt="Chart Cover"
										class="w-12 h-12 rounded-lg object-cover"
									/>
								} @else {
									<div class="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
										<ng-glyph name="music_note" class="text-on-surface/50" />
									</div>
								}
								<div class="flex flex-col">
									<span class="font-medium text-sm">{{ chart.track.title }}</span>
									<span class="text-xs text-on-surface/70">{{ chart.track.artist }}</span>
								</div>
							</div>
						}
					</div>
				</div>
			}
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
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourPassDialogComponent {
	dialogRef = inject<MatDialogRef<TourPassDialogComponent>>(MatDialogRef);
	data = inject<TourPassDialogData>(MAT_DIALOG_DATA);

	private _snackBar = inject(MatSnackBar);
	private shareService = inject(ShareService);
	private router = inject(Router);

	get buttons() {
		return [
			{
				icon: "playlist_play",
				data: `${this.data.tourpass.charts?.length ?? 0} charts`,
			},
			{
				icon: "download",
				data: `${this.data.tourpass.downloadsSum} downloads`,
			},
			{
				icon: "calendar_today",
				data: `Updated ${convertDateTimeToHumanReadable(this.data.tourpass.updatedAt?.toString() ?? '')}`,
			},
		].filter((button) => button.data && !button.data.startsWith("0 charts"));
	}

	openChart(chartId: string) {
		this.dialogRef.close();
		this.router.navigate(["/link/chart", chartId]);
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
		const url = `${window.location.origin}/link/tourpass/${this.data.tourpass.id}`;
		this.shareService.share(url);
		this.dialogRef.close();
	}

	onClose() {
		this.dialogRef.close();
	}
}
