import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";

// Screens
import { WorkshopScreenComponent } from "./subcomponents/workshop-screen/workshop-screen.component";

// Subcomponents
import { LandingTagComponent } from "./subcomponents/tag.component";

// Services
import { ChangelogService } from "@/services/changelog.service";

@Component({
	selector: "app-landing",
	imports: [
		MatButtonModule,
		MatTooltipModule,
		MatIconModule,
		RouterLink,
		LandingTagComponent,
		// Screens
		WorkshopScreenComponent,
	],
	templateUrl: "./landing.html",
})
export class LandingComponent {
	changelogService = inject(ChangelogService);
	latestReleaseTags = this.changelogService.latestReleaseTags;

	isDebugMode = false;

	toggleDebug() {
		this.isDebugMode = !this.isDebugMode;
	}

	get mobileReleaseText(): string | undefined {
		if (this.isDebugMode) return undefined;
		const tags = this.latestReleaseTags();
		if (!tags) return undefined;
		return (
			tags?.tags.find((t) => t.name.toLowerCase() === "mobile")
				?.description || undefined
		);
	}

	get desktopReleaseText(): string | undefined {
		if (this.isDebugMode) return undefined;
		const tags = this.latestReleaseTags();
		if (!tags) return undefined;
		return (
			tags?.tags.find((t) => t.name.toLowerCase() === "desktop")
				?.description || undefined
		);
	}

	get releaseLabel(): string | undefined {
		if (this.isDebugMode) return undefined;
		const tags = this.latestReleaseTags();
		return tags ? tags.version.split("-")[0] : undefined;
	}
}
