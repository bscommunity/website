import {
	ChangeDetectionStrategy,
	Component,
	ChangeDetectorRef,
	OnDestroy,
	OnInit,
	inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

// Material
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Components
import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { PanelComponent } from "@/components/panel/panel.component";
import { ChartPreviewComponent } from "@/components/chart-preview/chart-preview.component";

// Services
import { ChartService } from "@/services/api/chart.service";

// Types
import { type DialogData } from "@/services/publish/publish.service";
import type { ChartModel } from "@/models/chart.model";
import { transformDuration } from "@/lib/time";
import { type TourPassFormData } from "@/services/publish/handlers/tourpass-publish.handler";
import { SortOption } from "@/models/enums/sort-option.enum";

const MAX_TOURPASS_CHARTS = 18;

@Component({
	selector: "app-publish-tourpass-setlist",
	template: `
		<h2 mat-dialog-title>Setlist</h2>
		<form (ngSubmit)="onSubmit()">
			<mat-dialog-content class="mat-typography flex! flex-col gap-4">
				<p>
					Select the charts which will make part of your all new tour
					pass
				</p>

				<app-searchbar
					placeholder="Search in your library"
					[onSearch]="onSearch.bind(this)"
					[isLoading]="isLoading"
				></app-searchbar>

				<div class="flex flex-wrap items-center gap-6">
					<div class="flex items-center gap-2">
						<mat-icon inline>library_music</mat-icon>
						<span>{{ selectedCharts.length }} selected</span>
					</div>
					<div class="flex items-center gap-2">
						<mat-icon inline>music_video</mat-icon>
						<span>~{{ totalDurationLabel }}</span>
					</div>
					<div class="flex items-center gap-2">
						<mat-icon inline>local_fire_department</mat-icon>
						<span>{{ estimatedDifficultyLabel }}</span>
					</div>
				</div>

				<app-panel [variant]="selectionError ? 'warning' : 'info'">
					{{
						selectionError ||
							"A main artist and difficulty can be estimated based on your setlist"
					}}
				</app-panel>

				@if (isLoading) {
					<div class="flex items-center justify-center py-6">
						<mat-progress-spinner
							diameter="28"
							mode="indeterminate"
						></mat-progress-spinner>
					</div>
				} @else if (charts.length === 0) {
					<p class="text-center text-sm text-on-surface-variant">
						No charts found in your library.
					</p>
				} @else {
					<ul class="flex flex-col gap-4">
						@for (chart of charts; track chart.id) {
							<app-chart-preview
								class="pointer-events-none"
								size="sm"
								[variant]="
									isSelected(chart) ? 'selected' : 'default'
								"
								[showItems]="[]"
								[chart]="chart"
								[routerLink]="null"
							>
								<mat-checkbox
									chartAction
									class="pointer-events-auto"
									[checked]="isSelected(chart)"
									(change)="toggleSelection(chart)"
								></mat-checkbox>
							</app-chart-preview>
						}
					</ul>
				}
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button
					mat-button
					type="button"
					(click)="dialogRef.close('back')"
				>
					Back
				</button>
				<button
					mat-button
					type="submit"
					[disabled]="selectedCharts.length === 0"
				>
					Continue
				</button>
			</mat-dialog-actions>
		</form>
	`,
	imports: [
		FormsModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		SearchbarComponent,
		PanelComponent,
		ChartPreviewComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishTourPassSetlistComponent implements OnInit, OnDestroy {
	private chartService = inject(ChartService);
	private cdr = inject(ChangeDetectorRef);
	private destroy$ = new Subject<void>();

	dialogRef =
		inject<MatDialogRef<PublishTourPassSetlistComponent>>(MatDialogRef);
	data = inject<DialogData<TourPassFormData>>(MAT_DIALOG_DATA);

	charts: ChartModel[] = [];
	selectedCharts: ChartModel[] = [];
	isLoading = false;
	selectionError = "";

	ngOnInit() {
		const initialSelection = this.data.formData.selectedCharts || [];
		this.selectedCharts = [...initialSelection];
		this.fetchCharts();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onSearch(query: string) {
		this.fetchCharts(query);
	}

	fetchCharts(query = "") {
		this.isLoading = true;
		this.cdr.markForCheck();
		this.chartService
			.getCharts(
				{
					query,
					categories: [],
					difficulties: [],
					genres: [],
					versions: [],
					sortBy: SortOption.LAST_UPDATED,
				},
				{
					isDashboard: true,
					myCharts: true,
					storage: "persistent",
				},
			)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					this.charts = response.first || [];
					this.isLoading = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.charts = [];
					this.isLoading = false;
					this.cdr.markForCheck();
				},
			});
	}

	isSelected(chart: ChartModel): boolean {
		return this.selectedCharts.some((item) => item.id === chart.id);
	}

	toggleSelection(chart: ChartModel) {
		if (this.isSelected(chart)) {
			this.selectedCharts = this.selectedCharts.filter(
				(item) => item.id !== chart.id,
			);
			this.selectionError = "";
			return;
		}

		if (this.selectedCharts.length >= MAX_TOURPASS_CHARTS) {
			this.selectionError = `You exceeded the max amount of charts a tour pass can have (${this.selectedCharts.length + 1}/${MAX_TOURPASS_CHARTS})`;
			return;
		}

		this.selectedCharts = [...this.selectedCharts, chart];
		this.selectionError = "";
	}

	get totalDurationLabel(): string {
		const totalSeconds = this.selectedCharts.reduce((sum, chart) => {
			const duration = chart.track?.duration || 0;
			return sum + duration;
		}, 0);
		return transformDuration(totalSeconds);
	}

	get estimatedDifficultyLabel(): string {
		if (this.selectedCharts.length === 0) return "No difficulty yet";
		const totalScore = this.selectedCharts.reduce((sum, chart) => {
			const difficulty = chart.difficulty;
			if (difficulty === "HARD") return sum + 2;
			if (difficulty === "EXTREME") return sum + 3;
			return sum + 1;
		}, 0);
		const avg = totalScore / this.selectedCharts.length;
		if (avg >= 2.6) return "Slightly extreme";
		if (avg >= 1.6) return "Hard";
		return "Normal";
	}

	private getEstimatedArtist(): string {
		if (this.selectedCharts.length === 0) return "";
		const counts = new Map<string, number>();
		this.selectedCharts.forEach((chart) => {
			const artist = chart.track?.artist || "";
			if (!artist) return;
			counts.set(artist, (counts.get(artist) || 0) + 1);
		});
		let topArtist = "";
		let topCount = 0;
		counts.forEach((count, artist) => {
			if (count > topCount) {
				topArtist = artist;
				topCount = count;
			}
		});
		return topArtist;
	}

	onSubmit() {
		if (this.selectedCharts.length === 0) {
			this.selectionError = "Select at least one chart to continue.";
			return;
		}

		const estimatedArtist = this.getEstimatedArtist();
		this.dialogRef.close({
			chartIds: this.selectedCharts.map((chart) => chart.id),
			selectedCharts: [...this.selectedCharts],
			artist: this.data.formData.artist || estimatedArtist,
		});
	}
}
