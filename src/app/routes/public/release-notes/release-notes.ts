import { Component, OnInit, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

// Components
import { ReleaseTemplateComponent } from "@/components/release-template/release-template.component";
import { PanelComponent } from "@/components/panel/panel.component";

// Services
import { ReleaseNoteService } from "@/services/release-note.service";

@Component({
	selector: "app-release-notes",
	imports: [ReleaseTemplateComponent],
	templateUrl: "./release-notes.html",
})
export class ReleaseNotes implements OnInit {
	releaseNoteService = inject(ReleaseNoteService);
	releaseNotes = this.releaseNoteService.releaseNotes;

	releaseEmojis = ["🎉", "🎉", "✨", "🚀", "🥳", "🥳", "🆕", "😎", "😎"];

	getRandomEmoji(): string {
		const randomIndex = Math.floor(
			Math.random() * this.releaseEmojis.length,
		);
		return this.releaseEmojis[randomIndex];
	}

	ngOnInit() {
		this.releaseNoteService.fetchReleaseNotes();
	}
}
