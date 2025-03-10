import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

// Components
import { QrCodeComponent } from "ng-qrcode";
import { LargePanelComponent } from "@/components/panel/large-panel.component";
import { PublicHeaderComponent } from "@/components/public-header/public-header.component";

@Component({
	selector: "app-link",
	imports: [
		MatIconModule,
		MatButtonModule,
		QrCodeComponent,
		LargePanelComponent,
		PublicHeaderComponent,
	],
	templateUrl: "./link.component.html",
})
export class LinkComponent {
	route: ActivatedRoute = inject(ActivatedRoute);

	contentType = null;
	contentId = null;

	constructor() {
		this.contentType = this.route.snapshot.params["type"];
		this.contentId = this.route.snapshot.params["id"];
	}
}
