import { Injectable } from "@angular/core";

export interface ChartFileData {
	notesAmount: number;
	effectsAmount: number;
	bpm: number;
	duration: number; // in seconds
}

@Injectable({
	providedIn: "root",
})
export class DecodeService {
	decodeChartFile(file: File): Promise<ChartFileData> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				if (!content) {
					reject(new Error("Failed to read file content"));
					return;
				}

				try {
					const notesAmount = this.countNotes(content);
					const effectsAmount = this.countEffects(content);
					const bpm = this.getBPM(content);
					const duration = this.calculateDuration(content, bpm);

					resolve({
						notesAmount,
						effectsAmount,
						bpm,
						duration,
					});
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = () => {
				reject(new Error("Failed to read file"));
			};

			reader.readAsText(file);
		});
	}

	private countNotes(content: string): number {
		const expertSingleSection = this.getSection(content, "ExpertSingle");
		const notePattern = /\d+\s*=\s*N\s*\d+\s*\d+/g;
		const matches = expertSingleSection.match(notePattern);
		return matches ? matches.length : 0;
	}

	private countEffects(content: string): number {
		const eventsSection = this.getSection(content, "Events");
		// Match lines that define effects (E) but exclude those containing "section"
		const effectPattern = /\d+\s*=\s*E\s*"(?!section\b).*?"/g;
		const matches = eventsSection.match(effectPattern);
		return matches ? matches.length : 0;
	}

	private getBPM(content: string): number {
		const syncTrackSection = this.getSection(content, "SyncTrack");
		const bpmPattern = /\d+\s*=\s*B\s*(\d+)/;
		const match = syncTrackSection.match(bpmPattern);
		if (match && match[1]) {
			return parseInt(match[1]) / 1000; // Convert from micro-BPM to BPM
		}
		throw new Error("BPM not found in file");
	}

	private calculateDuration(content: string, bpm: number): number {
		const expertSingleSection = this.getSection(content, "ExpertSingle");
		const lastNotePattern = /(\d+)\s*=\s*N\s*\d+\s*\d+/g;
		let lastNoteTime = 0;

		let match;
		while ((match = lastNotePattern.exec(expertSingleSection)) !== null) {
			lastNoteTime = Math.max(lastNoteTime, parseInt(match[1]));
		}

		if (lastNoteTime === 0) {
			throw new Error("No notes found to calculate duration");
		}

		const beatsPerSecond = bpm / 60;
		const resolution = this.getResolution(content);
		return lastNoteTime / (resolution * beatsPerSecond);
	}

	private getResolution(content: string): number {
		const songSection = this.getSection(content, "Song");
		const resolutionPattern = /Resolution\s*=\s*(\d+)/;
		const match = songSection.match(resolutionPattern);
		if (match && match[1]) {
			return parseInt(match[1]);
		}
		throw new Error("Resolution not found in file");
	}

	private getSection(content: string, sectionName: string): string {
		const sectionPattern = new RegExp(
			`\\[${sectionName}\\]\\s*\\{([\\s\\S]*?)\\}`,
			"i",
		);
		const match = sectionPattern.exec(content);
		if (match && match[1]) {
			return match[1].trim(); // Remove any extra whitespace around the content
		}
		throw new Error(`Section [${sectionName}] not found in file`);
	}
}
