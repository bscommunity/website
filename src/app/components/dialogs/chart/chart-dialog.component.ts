import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";

// Material
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

// Types
import { MatIcon } from "@angular/material/icon";

// Models
import { ChartModel } from "@/models/chart.model";
import { MatChipsModule } from "@angular/material/chips";
import { convertDateTimeToHumanReadable } from "@/lib/time";
import { ChartContributorsComponent } from "@/components/chart-contributors/chart-contributors.component";

interface ChartDialogData {
	chart: ChartModel;
}

@Component({
	selector: "app-dialog-chart",
	template: `
		<div class="flex flex-col items-start justify-start px-9 pt-9 pb-6">
			<h6 class="mb-2 text-sm font-medium">Chart</h6>
			<h2 class="text-2xl font-bold">
				{{ data.chart.track }}
			</h2>
			<h3 class="text-lg text-on-surface/70">
				{{ data.chart.artist }}
			</h3>
		</div>

		<mat-dialog-content class="mat-typography !flex flex-col gap-6">
			@if (
				data.chart.contributors && data.chart.contributors.length > 0
			) {
				<app-chart-contributors
					[contributors]="data.chart.contributors"
				></app-chart-contributors>
			}
			<div
				class="flex flex-row items-center justify-center gap-2 h-42 md:h-48"
				(click)="openVideo()"
			>
				<img
					[src]="data.chart.coverUrl"
					alt="Chart Cover"
					class="h-full object-contain rounded-[28px] shadow-md"
				/>
				@if (getEmbedUrl()) {
					<iframe
						[src]="getEmbedUrl()"
						[style.pointer-events]="'none'"
						class="h-full w-full object-contain rounded-[28px] shadow-md cursor-pointer"
						allowfullscreen
					></iframe>
				} @else {
					<div
						class="flex items-center justify-center h-full w-full rounded-[28px] bg-on-surface/10"
					>
						<p class="text-center text-sm px-3">
							No preview available.
						</p>
					</div>
				}
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
		<mat-dialog-actions class="flex flex-col md:flex-row">
			<a class="flex! flex-1!" mat-stroked-button (click)="onShare()">
				<mat-icon> share </mat-icon>
				Share
			</a>
			<a
				class="flex! flex-1!"
				mat-flat-button
				href="bscm://link/chart/{{ data.chart.id }}"
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
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartDialogComponent {
	private sanitizer = inject(DomSanitizer);

	dialogRef = inject<MatDialogRef<ChartDialogComponent>>(MatDialogRef);
	data = inject<ChartDialogData>(MAT_DIALOG_DATA);

	buttons = [
		{
			icon: "timer",
			data: this.formatDuration(this.data.chart.latestVersion.duration),
		},
		{
			icon: "music_note",
			data: `${this.data.chart.latestVersion.notesAmount} notes`,
		},
		{
			icon: "blur_on",
			data: `${this.data.chart.latestVersion.effectsAmount} effects`,
		},
		{
			icon: "download",
			data: `${this.data.chart.latestVersion.downloadsAmount} downloads`,
		},
		{
			icon: "calendar_today",
			data: `Updated ${convertDateTimeToHumanReadable(this.data.chart.latestVersion.publishedAt.toString())}`,
		},
	];

	getEmbedUrl() {
		if (!this.data.chart.latestVersion.previewUrl) return "";
		const url = new URL(this.data.chart.latestVersion.previewUrl);
		const videoId = url.searchParams.get("v");
		if (!videoId) return "";
		const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&playlist=${videoId}`;
		return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
	}

	openVideo() {
		if (this.data.chart.latestVersion.previewUrl) {
			window.open(this.data.chart.latestVersion.previewUrl, "_blank");
		}
	}

	formatDuration(duration: number) {
		const minutes = Math.floor(duration / 60);
		const seconds = Math.floor(duration % 60);
		return `${minutes}m${seconds}s`;
	}

	onShare() {
		// Generate shareable link
		/* const chartId = this.data.chart.id;
        const url = this.router.serializeUrl(
            this.router.createUrlTree([`/charts/${chartId}`]),
        ); */

		this.dialogRef.close();
	}
}
