import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
} from "@angular/core";

import { Router, RouterLink, RouterLinkActive } from "@angular/router";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatRippleModule } from "@angular/material/core";

import { UploadDialogService } from "../upload/upload.service";
import { AuthService } from "app/auth/auth.service";
import type { UserModel } from "@/models/user.model";

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
export class HeaderComponent implements OnInit {
	private _snackBar = inject(MatSnackBar);
	private uploadDialog = inject(UploadDialogService);

	constructor(
		private authService: AuthService,
		private router: Router,
	) {}

	user: UserModel | null = null;

	ngOnInit(): void {
		this.user = this.authService.user;
		/* this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
			if (isLoggedIn) {
				this.user = this.authService.user;
			} else {
				this.user = null;
			}
		}); */
	}

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

	openProfile() {}

	openUploadDialog() {
		this.uploadDialog.open();
	}

	onLogoutButtonClick() {
		this.authService.logout();
		this.router.navigate(["/login"], { onSameUrlNavigation: "reload" });
	}
}
