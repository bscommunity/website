import { inject, Injectable } from "@angular/core";
import { ValidationErrorKey, ValidationService } from "./validation.service";
import { FormGroup, Validators, ValidatorFn } from "@angular/forms";

export interface BaseFormFieldConfig {
	key: string;
	label: string;
	required?: boolean;
	hint?: string;
}

export interface TextFieldConfig extends BaseFormFieldConfig {
	type: "text";
	formControlName: string;
	placeholder?: string;
	inputType?: "text" | "url" | "email" | "number";
	validators?: ValidatorFn[];
	validationMessages?: Record<string, string>;
	// Data processing for text fields (e.g., extract YouTube ID from URL)
	processValue?: (value: any) => any;
}

export interface FileFieldConfig extends BaseFormFieldConfig {
	type: "file";
	accept: string[];
	// Callback to process file data and update multiple form fields
	onFileProcessed: (data: any, formGroup: FormGroup) => void;
}

export type FormFieldConfig = TextFieldConfig | FileFieldConfig;

export interface FormMode {
	title: string;
	description: string;
	fields: FormFieldConfig[];
}

export interface GenericFormData {
	[key: string]: any;
}

@Injectable({ providedIn: "root" })
export class FormService {
	private validationService = inject(ValidationService);

	// Generic method to create common field types
	createUrlField(
		key: string,
		label: string,
		formControlName: string,
		options: {
			placeholder?: string;
			hint?: string;
			required?: boolean;
			fileExtension?: string; // for file URL validation
			videoUrl?: boolean; // for YouTube validation
			processValue?: (value: any) => any;
			validationMessages?: Record<string, string>;
		} = {},
	): TextFieldConfig {
		const validators: ValidatorFn[] = [];
		const messages: Record<string, string> = {
			invalidUrl: "Please enter a valid URL",
			notHttps: "Please enter a valid URL",
			...options.validationMessages,
		};

		if (options.required) {
			validators.push(Validators.required);
			messages["required"] = `${label} is <strong>required</strong>`;
		}

		validators.push(this.validationService.createUrlValidator());

		if (options.fileExtension) {
			validators.push(
				this.validationService.createPatternValidator(
					new RegExp(`^https://.*\\.${options.fileExtension}$`, "i"),
					"invalidFileUrl",
				),
			);
			messages["invalidFileUrl"] =
				`URL must point to a .${options.fileExtension} file`;
		}

		if (options.videoUrl) {
			validators.push(this.validationService.getYouTubeValidator());
			messages["invalidVideoUrl"] =
				options.validationMessages?.["invalidVideoUrl"] ||
				"Must be a YouTube video URL";
		}

		return {
			type: "text",
			key,
			label,
			formControlName,
			inputType: "url",
			placeholder: options.placeholder,
			hint: options.hint,
			required: options.required,
			validators,
			validationMessages: messages,
			processValue: options.processValue,
		};
	}

	createFileField(
		key: string,
		label: string,
		accept: string[],
		onFileProcessed: (data: any, formGroup: FormGroup) => void,
		options: {
			required?: boolean;
			hint?: string;
		} = {},
	): FileFieldConfig {
		return {
			type: "file",
			key,
			label,
			accept,
			required: options.required,
			hint: options.hint,
			onFileProcessed,
		};
	}

	createTextField(
		key: string,
		label: string,
		formControlName: string,
		options: {
			placeholder?: string;
			hint?: string;
			required?: boolean;
			inputType?: "text" | "url" | "email" | "number";
			validators?: ValidatorFn[];
			validationMessages?: Record<ValidationErrorKey, string>;
			processValue?: (value: any) => any;
		} = {},
	): TextFieldConfig {
		const validators: ValidatorFn[] = [];
		const messages: Record<string, string> = {
			...options.validationMessages,
		};

		if (options.required) {
			validators.push(Validators.required);
			messages["required"] = `${label} is <strong>required</strong>`;
		}

		return {
			type: "text",
			key,
			label,
			formControlName,
			inputType: options.inputType || "text",
			placeholder: options.placeholder,
			hint: options.hint,
			required: options.required,
			validators,
			validationMessages: messages,
			processValue: options.processValue,
		};
	}

	// Helper for YouTube URL processing
	extractYouTubeVideoId = (url: string): string => {
		const patterns = [
			/^https:\/\/youtu\.be\/([\w-]+)(?:\?.*)?$/i,
			/^https:\/\/www\.youtube\.com\/watch\?v=([\w-]+)(?:&.*)?$/i,
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match?.[1]) return match[1];
		}

		return url;
	};
}
