import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgGlyph } from "@ng-icons/core";

// Screens
// import { WorkshopScreenComponent } from "./subcomponents/workshop-screen/workshop-screen.component";

// Subcomponents
import { LandingTagComponent } from "./subcomponents/tag.component";

// Services
import { ReleaseNoteService } from "@/services/release-note.service";

@Component({
	selector: "app-landing",
	imports: [
		MatButtonModule,
		MatTooltipModule,
		NgGlyph,
		RouterLink,
		LandingTagComponent,
		// Screens
		// WorkshopScreenComponent,
	],
	templateUrl: "./landing.html",
})
export class LandingComponent {
	releaseNoteService = inject(ReleaseNoteService);
	latestReleaseTags = this.releaseNoteService.latestReleaseTags;

	isDebugMode = false;

	toggleDebug() {
		this.isDebugMode = !this.isDebugMode;
	}

	get mobileReleaseText(): string {
		if (this.isDebugMode) return "...";
		const tags = this.latestReleaseTags();
		if (!tags) return "...";
		return (
			tags?.tags.find((t) => t.name.toLowerCase() === "mobile")
				?.description || "..."
		);
	}

	get desktopReleaseText(): string {
		if (this.isDebugMode) return "...";
		const tags = this.latestReleaseTags();
		if (!tags) return "...";
		return (
			tags?.tags.find((t) => t.name.toLowerCase() === "desktop")
				?.description || "..."
		);
	}

	get releaseLabel(): string | undefined {
		if (this.isDebugMode) return undefined;
		const tags = this.latestReleaseTags();
		return tags ? tags.version.split("-")[0] : undefined;
	}
}
