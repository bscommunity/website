import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from "@angular/core";

import { RouterModule } from "@angular/router";

// Material
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";

// Components
import { SettingsCardComponent } from "./subcomponents/card.component";
import { ConfirmationDialogComponent } from "@/components/dialogs/confirmation/confirmation-dialog.component";
import { TabContentWrapperComponent } from "@/components/tabs/tab-content-wrapper.component";
import {
	type Tab,
	TabNavBarComponent,
} from "@/components/tabs/tab-nav-bar.component";
import { TabPanelHeightDirective } from "@/components/tabs/tab-panel-height.directive";

// Services
import { OAuthService } from "@/services/oauth.service";

@Component({
	selector: "app-settings",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	imports: [
		RouterModule,
		MatTabsModule,
		MatButtonModule,
		MatSlideToggleModule,
		MatIconModule,
		SettingsCardComponent,
		TabContentWrapperComponent,
		TabPanelHeightDirective,
		TabNavBarComponent,
	],
	templateUrl: "./settings.html",
})
export class Settings {
	private readonly dialog = inject(MatDialog);
	private readonly oAuthService = inject(OAuthService);

	tabs: Tab<null>[] = [
		{ label: "Account", showLabel: true, value: "account" },
		{ label: "Connections", showLabel: true, value: "connections" },
	];
	currentTab = this.tabs[0].value;

	oAuthUrl = this.oAuthService.getGoogleOAuthUrl();
	hasDriveScope = this.oAuthService.hasDriveScopeSignal;

	deleteAccount() {
		// Logic to delete the account
		console.log("Account deletion logic goes here.");
	}

	async unlinkOperation() {
		if (!this.oAuthService.hasDriveScopeSignal()) {
			throw new Error("Google Drive scope is not linked.");
		}

		await this.oAuthService.unlinkGoogleAccount();
	}

	openUnlinkConfirmationDialog() {
		this.dialog.open(ConfirmationDialogComponent, {
			data: {
				title: "Unlink Google Account",
				description:
					"Are you sure you want to unlink your Google account? You'll no longer be able to directly upload files to Google Drive.",
				error: "Failed to unlink Google account. Please try again.",
				success: "Google account unlinked successfully.",
				operation: this.unlinkOperation.bind(this),
			},
		});
	}
}
