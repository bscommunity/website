import { Component, OnInit, inject } from "@angular/core";

// Components
import { ReleaseTemplateComponent } from "@/components/release-template/release-template.component";

// Services
import { ChangelogService } from "@/services/changelog.service";

@Component({
	selector: "app-release-notes",
	imports: [ReleaseTemplateComponent],
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
