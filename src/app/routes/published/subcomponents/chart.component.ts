import { RouterLink, UrlTree } from "@angular/router";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

import { MatIconModule } from "@angular/material/icon";

// Models
import { ChartModel } from "@/models/chart.model";

// Libs
import { transformDuration } from "@/lib/time";
import { Difficulty, getDifficultyIcon } from "@/models/enums/difficulty.enum";
import { CoverArtComponent } from "../../../components/cover-art/cover-art.component";

export enum Tendency {
	Up = "up",
	Down = "down",
	Neutral = "neutral",
}

@Component({
	selector: "app-chart",
	imports: [MatIconModule, RouterLink, CoverArtComponent],
	template: `
		<a
			class="flex flex-row items-start justify-start gap-4 bg-surface-container hover:bg-surface-container-low transition-colors duration-75 border border-outline-variant rounded-2xl p-6 cursor-pointer"
			[routerLink]="routerLink"
			title="{{ this.chart.track }} - {{ this.chart.artist }}"
		>
			<app-cover-art
				[src]="this.chart.coverUrl"
				[alt]="this.chart.track"
				[difficulty]="chart.difficulty"
			></app-cover-art>
			<div
				class="flex flex-col flex-1 items-start justify-start gap-4 relative overflow-hidden"
			>
				<div
					class="flex flex-col items-start justify-start gap-0.5 w-full"
				>
					<div
						class="flex flex-row items-center justify-start gap-2 w-full"
					>
						<p
							class="text-base font-medium overflow-hidden text-ellipsis line-clamp-1"
						>
							{{ this.chart.track }}
						</p>
						@if (this.chart.isDeluxe) {
							<mat-icon
								svgIcon="deluxe"
								inline="true"
								class="text-on-surface !w-6 !h-6 -mt-0.5"
								aria-hidden="false"
								aria-label="Deluxe icon"
							></mat-icon>
						}
						@if (this.chart.isExplicit) {
							<mat-icon inline>explicit</mat-icon>
						}
						<!-- @if (this.chart.ranking && this.chart.track.length < 20) {
							<div
								class="ml-auto flex flex-row items-center justify-start gap-2 text-secondary"
							>
								@if (tendency !== tendencyNeutral) {
									<div
										class="w-0 h-0 border-l-transparent border-l-[5px] border-r-transparent border-r-[5px] border-b-[5px]"
										[ngClass]="{
											'border-b-[green]':
												tendency === tendencyUp,
											'border-b-[red]':
												tendency === tendencyDown,
										}"
									></div>
								}
								{{ ranking }}º
							</div>
						} -->
					</div>
					<p class="text-sm font-medium line-clamp-1">
						{{ this.chart.artist }}
					</p>
				</div>
				<div
					class="flex flex-row items-center justify-start w-full gap-4"
				>
					<div class="flex flex-row items-center justify-start gap-2">
						<mat-icon inline>timer</mat-icon>
						<span class="line-clamp-1">{{
							transformDuration(this.chart.latestVersion.duration)
						}}</span>
					</div>
					<div class="flex flex-row items-center justify-start gap-2">
						<mat-icon inline>music_note</mat-icon>
						<span class="line-clamp-1"
							>{{
								this.chart.latestVersion.notesAmount
							}}
							notes</span
						>
					</div>
				</div>
			</div>
		</a>
	`,
})
export class ChartComponent {
	@Input() chart!: ChartModel;

	transformDuration = transformDuration;

	@Input() routerLink: string | any[] | UrlTree | null | undefined = null;

	tendencyNeutral = Tendency.Neutral;
	tendencyUp = Tendency.Up;
	tendencyDown = Tendency.Down;
}
