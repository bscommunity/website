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
		youtube: [
			/^https:\/\/youtu\.be\/[\w-]+(?:\?.*)?$/i,
			/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+(?:&.*)?$/i,
		],
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
	getYouTubeValidator = (): ValidatorFn =>
		this.createPatternValidator(
			this.patterns.youtube,
			ValidationErrorKey.invalidVideoUrl,
		);
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
