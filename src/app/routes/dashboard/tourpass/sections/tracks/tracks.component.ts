import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
	output,
	signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";

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
		RouterLink,
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

	readonly tourPassId = input.required<string>();
	readonly charts = input.required<ChartModel[]>();
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

	getContributorsSummary(chart: ChartModel): string {
		if (!chart.contributors || chart.contributors.length === 0) {
			return "No contributors";
		}
		return chart.contributors
			.map((c) => c.user?.username || "Unknown")
			.join(", ");
	}
}
