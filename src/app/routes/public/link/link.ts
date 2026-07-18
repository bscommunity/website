import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

// Material
import { NgGlyph } from "@ng-icons/core";
import { MatButtonModule } from "@angular/material/button";

// Components
import { QrCodeComponent } from "ng-qrcode";
import { LargePanelComponent } from "@/components/panel/large-panel.component";

@Component({
	selector: "app-link",
	imports: [
		NgGlyph,
		MatButtonModule,
		QrCodeComponent,
		LargePanelComponent,
	],
	templateUrl: "./link.html",
})
export class Link {
	route: ActivatedRoute = inject(ActivatedRoute);

	contentType = null;
	contentId = null;

	constructor() {
		this.contentType = this.route.snapshot.params["type"];
		this.contentId = this.route.snapshot.params["id"];
	}
}
