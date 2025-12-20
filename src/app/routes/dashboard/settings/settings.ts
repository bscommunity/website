import {
	Component,
	CUSTOM_ELEMENTS_SCHEMA,
	inject,
	OnInit,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";

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

// Services
import { OAuthService } from "@/services/oauth.service";
import { TabContentWrapperComponent } from "@/components/tab-content-wrapper/tab-content-wrapper.component";

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
	],
	templateUrl: "./settings.html",
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
	hasDriveScope = this.oAuthService.hasDriveScopeSignal;

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
