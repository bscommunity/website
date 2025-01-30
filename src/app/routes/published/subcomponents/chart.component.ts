import { NgClass } from "@angular/common";
import { Component, Input } from "@angular/core";

import { MatIconModule } from "@angular/material/icon";

import { Difficulty } from "@/models/enums/difficulty.enum";
import { difficultiesIcons } from "assets/difficulties";

import { transformDuration } from "@/lib/time";

export enum Tendency {
	Up = "up",
	Down = "down",
	Neutral = "neutral",
}

export interface ChartProps {
	track: string;
	artist: string;
	coverUrl: string;
	duration: number;
	notesAmount: number;
	difficulty: Difficulty;
	isDeluxe?: boolean;
	isExplicit?: boolean;
	isFeatured?: boolean;
	ranking?: number;
	tendency?: Tendency;
}

@Component({
	selector: "app-chart",
	imports: [MatIconModule, NgClass],
	template: `
		<a
			class="flex flex-row items-start justify-start gap-4 bg-surface-container hover:bg-surface-container-low transition-colors duration-75 border border-outline-variant rounded-2xl p-6 cursor-pointer"
		>
			<div
				class="relative rounded-md overflow-hidden h-[82px] w-[82px] min-w-[82px]"
			>
				<img
					[src]="coverUrl"
					alt="Cover"
					class="w-full h-full aspect-square object-cover"
				/>
				@if (difficultyIcon) {
					<img
						class="absolute bottom-0 right-0 w-5 h-5 z-20"
						[src]="difficultyIcon"
						alt="Difficulty badge icon"
					/>
				}
			</div>
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
							{{ track }}
						</p>
						@if (isDeluxe) {
							<img
								src="assets/icons/deluxe.png"
								alt="Deluxe icon"
								class="w-4 invert dark:invert-0"
							/>
						}
						@if (isExplicit) {
							<mat-icon inline>explicit</mat-icon>
						}
						@if (ranking && track.length < 20) {
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
						}
					</div>
					<p class="text-sm font-medium">{{ artist }}</p>
				</div>
				<div
					class="flex flex-row items-center justify-start w-full gap-4"
				>
					<div class="flex flex-row items-center justify-start gap-2">
						<mat-icon inline>timer</mat-icon>
						<span class="line-clamp-1">{{ duration }}</span>
					</div>
					<div class="flex flex-row items-center justify-start gap-2">
						<mat-icon inline>music_note</mat-icon>
						<span class="line-clamp-1"
							>{{ notesAmount }} notes</span
						>
					</div>
				</div>
			</div>
		</a>
	`,
})
export class ChartComponent implements ChartProps {
	@Input() track = "";
	@Input() artist = "";
	@Input() coverUrl = "";
	@Input({
		transform: transformDuration,
	})
	duration = 0;
	@Input() notesAmount = 0;
	@Input() difficulty = Difficulty.Normal;
	@Input() isDeluxe: ChartProps["isDeluxe"] = false;
	@Input() isExplicit: ChartProps["isExplicit"] = false;
	@Input() isFeatured: ChartProps["isFeatured"] = false;
	@Input() ranking: ChartProps["ranking"] = 0;
	@Input() tendency: ChartProps["tendency"] = Tendency.Neutral;

	tendencyNeutral = Tendency.Neutral;
	tendencyUp = Tendency.Up;
	tendencyDown = Tendency.Down;

	difficultyIcon = difficultiesIcons[this.difficulty] || null;
}
