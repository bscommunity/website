import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { RouterLink, RouterLinkActive } from "@angular/router";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatRippleModule } from "@angular/material/core";
import { UploadDialog } from "../upload/upload.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	imports: [
		MatIconModule,
		MatMenuModule,
		MatButtonModule,
		MatRippleModule,
		RouterLink,
		RouterLinkActive,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
	readonly dialog = inject(MatDialog);
	private _snackBar = inject(MatSnackBar);

	openWarning() {
		this._snackBar.open(
			"This feature has not been implemented yet!",
			"Ok",
			{
				horizontalPosition: "right",
				verticalPosition: "bottom",
			},
		);
	}

	openUploadDialog() {
		const dialogRef = this.dialog.open(UploadDialog);

		dialogRef.afterClosed().subscribe((result) => {
			console.log(`Dialog result: ${result}`);
		});
	}
}
