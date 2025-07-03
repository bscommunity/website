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
	/**
	 * Fetches a ZIP file from the specified URL, extracts its contents, and parses the `info.json` file inside the ZIP.
	 * @param url - The URL to fetch the ZIP bundle from.
	 * @returns A promise that resolves to the file data extracted from `info.json`
	 * @throws If the fetch fails or if `info.json` is not found in the ZIP.
	 * @throws If parsing `info.json` fails.
	 */
	fetchBundleZip(url: string): Promise<File> {
		return fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Failed to fetch bundle zip: ${response.statusText}`,
					);
				}
				return response.blob();
			})
			.then((blob) => {
				const file = new File([blob], "bundle.zip", {
					type: "application/zip",
				});
				return file;
			})
			.catch((error) => {
				console.error(
					"Error fetching or processing bundle zip:",
					error,
				);
				throw new Error(`Failed to fetch bundle zip from URL: ${url}`);
			});
	}

	/**
	 * Extracts and parses the `info.json` file from the provided ZIP file.
	 * @param zipFile - The ZIP file to extract data from.
	 * @returns A promise that resolves to the parsed `BundleZipData` object.
	 * @throws If `info.json` is not found in the ZIP file or if parsing fails.
	 */
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
