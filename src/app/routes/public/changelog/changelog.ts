import { Component, OnInit, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

// Components
import { ReleaseTemplateComponent } from "@/components/release-template/release-template.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Services
import { ChangelogService } from "@/services/changelog.service";

@Component({
	selector: "app-release-notes",
	imports: [ReleaseTemplateComponent, PanelComponent, MatIconModule],
	templateUrl: "./changelog.html",
})
export class Changelog implements OnInit {
	changelogService = inject(ChangelogService);
	releaseNotes = this.changelogService.releaseNotes;

	releaseEmojis = ["🎉", "🎉", "✨", "🚀", "🥳", "🥳", "🆕", "😎", "😎"];

	getRandomEmoji(): string {
		const randomIndex = Math.floor(
			Math.random() * this.releaseEmojis.length,
		);
		return this.releaseEmojis[randomIndex];
	}

	ngOnInit() {
		this.changelogService.fetchReleaseNotes();
	}
}
