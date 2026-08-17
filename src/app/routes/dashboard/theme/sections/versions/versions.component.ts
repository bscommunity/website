import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { NgGlyph } from "@ng-icons/core";
import { MatSnackBar } from "@angular/material/snack-bar";

import { ChartSectionComponent } from "@/components/chart-section/chart-section.component";

@Component({
	selector: "app-theme-versions-section",
	imports: [
		NgGlyph,
		MatButtonModule,
		ChartSectionComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./versions.component.html",
})
export class VersionsSectionComponent {
	readonly themeId = input.required<string>();

	private _snackBar = inject(MatSnackBar);
	readonly dialog = inject(MatDialog);

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}
}
