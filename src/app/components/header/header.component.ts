import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
} from "@angular/core";

import { RouterLink, RouterLinkActive } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";

// Icons
import { NgIcon, NgGlyph } from "@ng-icons/core";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatRippleModule } from "@angular/material/core";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Types
import type { UserModel } from "@/models/user.model";

// Services
import { AuthService } from "@/services/auth.service";
import { PublishDialogService } from "@/services/publish/publish.service";
import { ChartPublishHandler } from "@/services/publish/handlers/chart-publish.handler";
import { TourPassPublishHandler } from "@/services/publish/handlers/tourpass-publish.handler";
import { ThemePublishHandler } from "@/services/publish/handlers/theme-publish.handler";

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	imports: [
		NgIcon,
		NgGlyph,
		MatMenuModule,
		MatButtonModule,
		MatRippleModule,
		RouterLink,
		RouterLinkActive,
		AvatarComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
	private authService = inject(AuthService);
	private chartPublishHandler = inject(ChartPublishHandler);
	private tourPassPublishHandler = inject(TourPassPublishHandler);
	private themePublishHandler = inject(ThemePublishHandler);

	private _snackBar = inject(MatSnackBar);
	private uploadDialog = inject(PublishDialogService);

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

		this.uploadDialog.setHandlers(
			{
				Chart: this.chartPublishHandler,
				Tourpass: this.tourPassPublishHandler,
				Theme: this.themePublishHandler,
			},
			"Chart",
		);
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

	/* openProfile() {
		this._snackBar.open("Profile page is not implemented yet!", "Ok", {
			horizontalPosition: "right",
			verticalPosition: "bottom",
		});
	} */

	openUploadDialog() {
		this.uploadDialog.open();
	}

	onLogoutButtonClick() {
		this.authService.logout();
	}
}
