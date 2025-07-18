import { Component, inject, input } from "@angular/core";
import { Router } from "@angular/router";

// Material
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

// Components
import { AsideSectionComponent } from "./aside-section.component";
import { AsideContainerComponent } from "./aside-container.component";
import { DifficultyMarkComponent } from "@/components/difficulty-mark/difficulty-mark.component";

// Services
import { ChartService } from "@/services/api/chart.service";

// Models
import { ChartModelWithLatestVersion } from "@/models/chart.model";

// Libs
import { transformDuration } from "@/lib/time";

@Component({
	selector: "app-aside",
	templateUrl: "./aside.component.html",
	imports: [
		AsideSectionComponent,
		AsideContainerComponent,
		DifficultyMarkComponent,
	],
})
export class AsideComponent {
	readonly dialog = inject(MatDialog);
	readonly _snackBar = inject(MatSnackBar);

	readonly router = inject(Router);
	readonly chartService = inject(ChartService);

	readonly chart = input.required<ChartModelWithLatestVersion>();

	transformDuration = transformDuration;
}
