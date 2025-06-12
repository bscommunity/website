import { Component, OnInit, signal } from "@angular/core";

// Components
import {
	type ReleaseNote,
	ReleaseNoteResponse,
	ReleaseTemplateComponent,
} from "@/components/release-template/release-template.component";
import { PublicHeaderComponent } from "@/components/public-header/public-header.component";

// Types

const GITHUB_URL = "https://api.github.com/repos/bscommunity/android/releases";

@Component({
	selector: "app-release-notes",
	imports: [ReleaseTemplateComponent, PublicHeaderComponent],
	templateUrl: "./release-notes.component.html",
})
export class ReleaseNotesComponent implements OnInit {
	releaseNotes = signal<ReleaseNote[] | undefined>(undefined);

	releaseEmojis = ["🎉", "🎉", "✨", "🚀", "🥳", "🥳", "🆕", "😎", "😎"];

	getRandomEmoji(): string {
		const randomIndex = Math.floor(
			Math.random() * this.releaseEmojis.length,
		);
		return this.releaseEmojis[randomIndex];
	}

	ngOnInit() {
		this.fetchReleaseNotes();
	}

	private async fetchReleaseNotes() {
		try {
			const response = await fetch(GITHUB_URL, {
				headers: {
					Accept: "application/vnd.github.v3+json",
				},
				cache: "no-cache",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch release notes");
			}

			const data = (await response.json()) as ReleaseNoteResponse[];

			console.log(this.releaseNotes());

			this.releaseNotes.set(
				data.map((release) => {
					const lines = release.body.split("\n");
					const features = lines
						.filter((line) => line.trim().startsWith("- feat:"))
						.map((line) => line.replace(/^- feat:\s*/, "").trim());
					const refactors = lines
						.filter((line) => line.trim().startsWith("- refactor:"))
						.map((line) =>
							line.replace(/^- refactor:\s*/, "").trim(),
						);
					const style = lines
						.filter((line) => line.trim().startsWith("- style:"))
						.map((line) => line.replace(/^- style:\s*/, "").trim());
					const fixes = lines
						.filter((line) => line.trim().startsWith("- fix:"))
						.map((line) => line.replace(/^- fix:\s*/, "").trim());

					return {
						version: release.tag_name,
						date: release.published_at,
						features,
						refactors,
						style,
						fixes,
					} as ReleaseNote;
				}),
			);

			/* console.log(
				"Release notes fetched successfully:",
				this.releaseNotes(),
			); */
		} catch (error) {
			console.error("Error fetching release notes:", error);
		}
	}
}
