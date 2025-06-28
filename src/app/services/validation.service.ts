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
	private readonly patterns = {
		youtube: [
			/^https:\/\/youtu\.be\/[\w-]+(?:\?.*)?$/i,
			/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+(?:&.*)?$/i,
		],
		zip: /^https:\/\/.*\/[\w-]+\.zip$/i,
		url: /^https?:\/\/.+/i,
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
	getYouTubeValidator = (): ValidatorFn =>
		this.createPatternValidator(
			this.patterns.youtube,
			ValidationErrorKey.invalidVideoUrl,
		);
	getUrlValidator = (): ValidatorFn =>
		this.createPatternValidator(
			this.patterns.url,
			ValidationErrorKey.invalidUrl,
		);
}
