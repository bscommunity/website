import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export enum ValidationErrorKey {
	invalidUrl = "invalidUrl",
	notHttps = "notHttps",
	invalidZipUrl = "invalidZipUrl",
	invalidVideoUrl = "invalidVideoUrl",
	invalidFileUrl = "invalidFileUrl",
	required = "required",
	invalidFileExtension = "invalidFileExtension",
}

@Injectable({ providedIn: "root" })
export class ValidationService {
	readonly patterns = {
		zip: /^https:\/\/.*\/[\w-]+\.zip$/i,
		url: /^https?:\/\/.+/i,
	};

	readonly messages = {
		invalidUrl: "Please enter a valid URL",
		notHttps: "URL must start with https://",
		invalidZipUrl: "URL must point to a .zip file",
		invalidVideoUrl: "Must be a YouTube video URL",
		invalidFileUrl: (ext: string) => `URL must point to a .${ext} file`,
		required: (label: string) => `${label} is <strong>required</strong>`,
	};

	createUrlValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (!control.value) return null;

			try {
				new URL(control.value);
			} catch {
				return { invalidUrl: true };
			}

			if (!control.value.toLowerCase().startsWith("https://")) {
				return { notHttps: true };
			}

			return null;
		};
	}

	createFileExtensionValidator(extension: string): ValidatorFn {
		const pattern = new RegExp(`^https://.*\\.${extension}$`, "i");
		return (control: AbstractControl): ValidationErrors | null => {
			if (!control.value) return null;

			if (!pattern.test(control.value)) {
				return { invalidFileUrl: true };
			}

			return null;
		};
	}

	createPatternValidator(
		patterns: RegExp | RegExp[],
		errorKey: string,
	): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (!control.value) return null;

			const patternArray = Array.isArray(patterns)
				? patterns
				: [patterns];
			const isValid = patternArray.some((pattern) =>
				pattern.test(control.value),
			);

			return isValid ? null : { [errorKey]: true };
		};
	}

	// Generic validators that can be reused
	getZipValidator = (): ValidatorFn =>
		this.createPatternValidator(
			this.patterns.zip,
			ValidationErrorKey.invalidZipUrl,
		);
	getFileExtensionValidator = (extension: string): ValidatorFn =>
		this.createFileExtensionValidator(extension);

	/**
	 * Extracts the YouTube video ID (11 chars) or returns null if it can't.
	 */
	extractYouTubeVideoId(input: string): string {
		const isYouTubeId = (id: string | null | undefined): boolean =>
			!!id && /^[A-Za-z0-9_-]{11}$/.test(id);

		if (isYouTubeId(input)) return input;

		const tryParse = (raw: string): string | null => {
			try {
				const u = new URL(raw);
				const host = u.hostname.replace(/^www\./i, "").toLowerCase();
				const pathParts = u.pathname.split("/").filter(Boolean);

				if (host === "youtu.be") {
					const id = pathParts[0];
					if (isYouTubeId(id)) return id!;
				}

				if (
					host.endsWith("youtube.com") ||
					host.endsWith("youtube-nocookie.com")
				) {
					const v = u.searchParams.get("v");
					if (isYouTubeId(v)) return v!;
					const idx = pathParts.findIndex((p) =>
						["embed", "shorts", "v"].includes(p.toLowerCase()),
					);
					if (idx >= 0 && isYouTubeId(pathParts[idx + 1]))
						return pathParts[idx + 1]!;
				}
			} catch {
				/* ignore */
			}

			throw new Error("Invalid URL format");
		};

		const fromUrl = tryParse(input);
		if (fromUrl) return fromUrl;

		if (!/^https?:\/\//i.test(input)) {
			const withProto = tryParse(`https://${input}`);
			if (withProto) return withProto;
		}

		const candidates: RegExp[] = [
			/^https?:\/\/youtu\.be\/([\w-]{11})(?:\?.*)?$/i,
			/^https?:\/\/(?:www\.)?youtube\.com\/watch\?[^#]*v=([\w-]{11})(?:[&#].*)?$/i,
			/^https?:\/\/(?:www\.)?youtube\.com\/embed\/([\w-]{11})(?:\?.*)?$/i,
			/^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([\w-]{11})(?:\?.*)?$/i,
		];
		for (const re of candidates) {
			const m = input.match(re);
			if (m && isYouTubeId(m[1])) return m[1];
		}
		throw new Error("Unable to extract YouTube video ID");
	}

	/**
	 * Validador de URL de vídeo YouTube usando extração de ID.
	 */
	getYouTubeValidator = (): ValidatorFn => {
		return (control: AbstractControl): ValidationErrors | null => {
			if (!control.value) return null;
			const id = this.extractYouTubeVideoId(control.value);
			return id ? null : { [ValidationErrorKey.invalidVideoUrl]: true };
		};
	};
}

/**
 * Supported input types for text fields
 */
export type TextInputType =
	| "text"
	| "url"
	| "email"
	| "number"
	| "password"
	| "tel";

/**
 * Common file types for better developer experience
 */
export type FileType =
	| "image/*"
	| "image/jpeg"
	| "image/png"
	| "image/gif"
	| "image/webp"
	| "audio/*"
	| "audio/mpeg"
	| "audio/wav"
	| "audio/ogg"
	| "video/*"
	| "video/mp4"
	| "video/webm"
	| ".pdf"
	| ".doc"
	| ".docx"
	| ".txt"
	| ".json"
	| ".csv";
