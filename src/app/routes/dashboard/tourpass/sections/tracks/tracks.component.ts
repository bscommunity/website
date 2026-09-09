import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
	output,
	signal,
} from "@angular/core";
import { Router } from "@angular/router";

// Material
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { NgGlyph, NgIcon } from "@ng-icons/core";

// Components
import {
	ChartSectionComponent,
	SectionBody,
	SectionHeader,
} from "@/components/chart-section/chart-section.component";
import { EditSetlistDialogComponent } from "../../dialogs/edit-setlist/edit-setlist-dialog.component";

// Models
import { ChartModel } from "@/models/chart.model";
import { getDifficultyIcon } from "@/models/enums/difficulty.enum";

@Component({
	selector: "app-tourpass-tracks-section",
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatTableModule,
		NgGlyph,
		NgIcon,
		ChartSectionComponent,
		SectionHeader,
		SectionBody,
	],
	templateUrl: "./tracks.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TracksSectionComponent {
	readonly dialog = inject(MatDialog);
	private router = inject(Router);

	readonly tourPassId = input.required<string>();
	readonly charts = input.required<ChartModel[]>();
	readonly isOwner = input<boolean>(false);
	readonly chartsChanged = output<ChartModel[]>();

	viewMode = signal<"list" | "grid">("list");

	readonly displayedColumns = ["track", "contributors"];

	getDifficultyIcon = getDifficultyIcon;

	openEditSetlistDialog() {
		const dialogRef = this.dialog.open(EditSetlistDialogComponent, {
			data: {
				tourpass: {
					id: this.tourPassId(),
					charts: this.charts(),
				},
			},
			width: "600px",
			maxHeight: "80vh",
			disableClose: true,
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result && result !== "back") {
				const updated = result as { charts?: ChartModel[] };
				if (updated.charts) {
					this.chartsChanged.emit(updated.charts);
				}
			}
		});
	}

	getUniqueContributors(chart: ChartModel) {
		const seen = new Set<string>();
		return chart.contributors.filter((contributor) => {
			if (seen.has(contributor.user.id)) {
				return false;
			}
			seen.add(contributor.user.id);
			return true;
		});
	}

	getContributorsSummary(chart: ChartModel): string {
		const unique = this.getUniqueContributors(chart);
		if (unique.length === 0) {
			return "No contributors";
		}
		return unique.map((c) => c.user?.username || "Unknown").join(", ");
	}

	navigateToChart(chartId: string) {
		this.router.navigate(["/dashboard/chart", chartId], {
			state: { tourPassId: this.tourPassId() },
		});
	}
}
