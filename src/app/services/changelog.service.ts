import { Injectable, signal, computed } from "@angular/core";
import {
	ReleaseNoteResponse,
	ReleaseNote,
} from "@/components/release-template/release-template.component";

export interface ReleaseTag {
	name: string;
	description: string;
}

export interface LatestReleaseTags {
	version: string;
	tags: ReleaseTag[];
}

@Injectable({
	providedIn: "root",
})
export class ChangelogService {
	releaseNotes = signal<ReleaseNote[]>([]);
	latestReleaseTags = computed(() => {
		const notes = this.releaseNotes();
		if (notes.length > 0) {
			const latest = notes[0];
			return { version: latest.version, tags: latest.tags || [] };
		}
		return null;
	});

	constructor() {
		this.loadFromStorage();
	}

	private loadFromStorage() {
		const stored = localStorage.getItem("allReleaseNotes");
		if (stored) {
			try {
				this.releaseNotes.set(JSON.parse(stored));
			} catch (error) {
				console.error(
					"Error parsing allReleaseNotes from localStorage:",
					error,
				);
			}
		}
	}

	async fetchReleaseNotes() {
		// If already loaded, skip
		if (this.releaseNotes().length > 0) return;

		try {
			const response = await fetch(
				"https://api.github.com/repos/bscommunity/android/releases",
				{
					headers: {
						Accept: "application/vnd.github.v3+json",
					},
					cache: "no-cache",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to fetch release notes");
			}

			const data = (await response.json()) as ReleaseNoteResponse[];

			const parsedReleases: ReleaseNote[] = data.map((release) => {
				const lines: string[] = release.body.split("\n");
				const features = lines
					.filter((line) => line.trim().startsWith("- feat:"))
					.map((line) => line.replace(/^- feat:\s*/, "").trim());
				const refactors = lines
					.filter((line) => line.trim().startsWith("- refactor:"))
					.map((line) => line.replace(/^- refactor:\s*/, "").trim());
				const style = lines
					.filter((line) => line.trim().startsWith("- style:"))
					.map((line) => line.replace(/^- style:\s*/, "").trim());
				const fixes = lines
					.filter((line) => line.trim().startsWith("- fix:"))
					.map((line) => line.replace(/^- fix:\s*/, "").trim());

				// Parse tags
				const tags: ReleaseTag[] = [];
				const tagsIndex = lines.findIndex(
					(line) => line.trim() === "## Tags:",
				);
				if (tagsIndex !== -1) {
					const tagsLines = lines.slice(tagsIndex + 1);
					let currentTag: ReleaseTag | null = null;
					for (const line of tagsLines) {
						const trimmed = line.trim();
						if (trimmed.startsWith("### ")) {
							if (currentTag) {
								tags.push(currentTag);
							}
							currentTag = {
								name: trimmed.replace("### ", ""),
								description: "",
							};
						} else if (
							currentTag &&
							trimmed &&
							!trimmed.startsWith("##")
						) {
							currentTag.description = trimmed;
						}
					}
					if (currentTag) {
						tags.push(currentTag);
					}
				}

				return {
					version: release.tag_name,
					date: release.published_at,
					features,
					refactors,
					style,
					fixes,
					tags,
				} as ReleaseNote;
			});

			localStorage.setItem(
				"allReleaseNotes",
				JSON.stringify(parsedReleases),
			);
			this.releaseNotes.set(parsedReleases);
		} catch (error) {
			console.error("Error fetching release notes:", error);
		}
	}
}
