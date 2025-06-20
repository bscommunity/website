import {
	Component,
	CUSTOM_ELEMENTS_SCHEMA,
	inject,
	OnInit,
} from "@angular/core";

// Material
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

// Components
import { SettingsWrapperComponent } from "./subcomponents/wrapper.component";
import { SettingsCardComponent } from "./subcomponents/card.component";
import { OAuthService } from "@/services/oauth.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../chart/dialogs/confirmation/confirmation-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { RouterModule } from "@angular/router";

@Component({
	selector: "app-settings",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	imports: [
		RouterModule,
		MatTabsModule,
		MatButtonModule,
		MatSlideToggleModule,
		MatIconModule,
		SettingsWrapperComponent,
		SettingsCardComponent,
	],
	templateUrl: "./settings.html",
	styleUrl: "./settings.css",
})
export class Settings implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly dialog = inject(MatDialog);
	private readonly oAuthService = inject(OAuthService);

	tabs = [
		{ label: "Account", value: "account" },
		{ label: "Connections", value: "connections" },
	];
	currentTab = this.tabs[0].value;

	oAuthUrl = this.oAuthService.getGoogleOAuthUrl();
	hasDriveScope = this.oAuthService.hasDriveScope;

	ngOnInit(): void {
		const section = this.route.snapshot.queryParamMap.get("section");
		this.currentTab =
			this.tabs.find((tab) => tab.value === section)?.value ||
			this.tabs[0].value;
	}

	deleteAccount() {
		// Logic to delete the account
		console.log("Account deletion logic goes here.");
	}

	openUnlinkConfirmationDialog() {
		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Unlink Google Account",
				description:
					"Are you sure you want to unlink your Google account? You'll no longer be able to directly upload files to Google Drive.",
				error: "Failed to unlink Google account. Please try again.",
				operation: async () => {
					if (!this.oAuthService.hasDriveScope) {
						throw new Error("Google Drive scope is not linked.");
					}

					await this.oAuthService.unlinkGoogleAccount();
					this.hasDriveScope = false;
				},
			},
		});
	}
}
