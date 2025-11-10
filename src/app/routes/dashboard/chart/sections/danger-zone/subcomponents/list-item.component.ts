import { Component, input, inject } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

// Material
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-danger-zone-list-item",
	templateUrl: "./list-item.component.html",
	imports: [MatButtonModule],
})
export class DangerZoneListItemComponent {
	private sanitizer = inject(DomSanitizer);

	readonly title = input<string>("");
	readonly description = input<string>("");
	readonly buttonLabel = input<string>("");
	readonly buttonAction = input<() => void>(() => { });

	safeDescription: SafeHtml = "";

	ngOnChanges() {
		this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(
			this.description(),
		);
	}
}
