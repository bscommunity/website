import { Component, Input } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

// Material
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-danger-zone-list-item",
	templateUrl: "./list-item.component.html",
	imports: [MatButtonModule],
})
export class DangerZoneListItemComponent {
	@Input() title: string = "";
	@Input() description: string = "";
	@Input() buttonLabel: string = "";
	@Input() buttonAction: () => void = () => {};

	safeDescription: SafeHtml = "";

	constructor(private sanitizer: DomSanitizer) {}

	ngOnChanges() {
		this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(
			this.description,
		);
	}
}
