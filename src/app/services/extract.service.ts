import { Injectable } from "@angular/core";

import * as zip from "@zip.js/zip.js";

export interface BundleZipData {
	title: string;
	artist: string;
	difficulty: number;
	bpm: number;
	type: "Promode" | "Regular";
}

@Injectable({
	providedIn: "root",
})
export class ExtractService {
	extractBundleZipData(zipFile: File): Promise<BundleZipData> {
		return new Promise((resolve, reject) => {
			const reader = new zip.ZipReader(new zip.BlobReader(zipFile));
			reader
				.getEntries()
				.then((entries) => {
					const infoEntry = entries.find(
						(entry) => entry.filename === "info.json",
					);

					if (!infoEntry) {
						reject(
							new Error("info.json not found in the zip file"),
						);
						return;
					}

					infoEntry.getData!(new zip.TextWriter()).then((text) => {
						try {
							const data: BundleZipData = JSON.parse(text);
							resolve(data);
						} catch (error) {
							reject(
								new Error(
									"Failed to parse info.json: " + error,
								),
							);
						}
					});
				})
				.catch(reject);
		});
	}
}
