import { Component, ViewChild, ElementRef, HostListener } from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
	selector: "app-public-header",
	imports: [MatIconModule, MatButtonModule, RouterLink, RouterLinkActive],
	templateUrl: "./public-header.component.html",
})
export class PublicHeaderComponent {
	@ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

	@HostListener("document:keydown", ["$event"])
	onKeyDown(event: KeyboardEvent) {
		if (event.key === "f" || event.key === "F") {
			if (!this.searchInput.nativeElement.value) {
				event.preventDefault();
				this.searchInput.nativeElement.focus();
			}
		}

		if (event.key === "Escape") {
			event.preventDefault();
			this.searchInput.nativeElement.value = "";
			this.searchInput.nativeElement.blur();
		}
	}
}
