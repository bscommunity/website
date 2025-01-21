import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";

@Component({
	selector: "app-upload",
	templateUrl: "./upload.component.html",
	imports: [MatDialogModule, MatButtonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDialog {}
