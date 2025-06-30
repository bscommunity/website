import { inject, Injectable } from "@angular/core";
import {
	type FileType,
	type TextInputType,
	ValidationErrorKey,
	ValidationService,
} from "./validation.service";
import {
	Validators,
	ValidatorFn,
	FormGroup,
	FormControl,
} from "@angular/forms";

/**
 * Base configuration for form fields
 */
interface BaseFieldConfig {
	key: string;
	label: string;
	required?: boolean;
	hint?: string;
	validators?: ValidatorFn[];
	validationMessages?: Record<string, string>;
}

/**
 * Text field configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
	readonly type: "text";
	placeholder?: string;
	inputType?: TextInputType;
	onValueProcessed?: (value: string) => string;
	urlFileExtension?: string;
}

/**
 * File field configuration
 */
export interface FileFieldConfig extends BaseFieldConfig {
	readonly type: "file";
	accept: (FileType | string)[];
	onFileSelected: (file: File) => void;
}

/**
 * Union type for any form field configuration
 */
export type FormFieldConfig = TextFieldConfig | FileFieldConfig;

@Injectable({ providedIn: "root" })
export class FormService {
	private validationService = inject(ValidationService);

	/**
	 * Creates a configured text field with validations
	 */
	createTextField(config: Omit<TextFieldConfig, "type">): TextFieldConfig {
		const validators: ValidatorFn[] = config.validators
			? [...config.validators]
			: [];
		const messages: Record<string, string> = {
			...config.validationMessages,
		};

		if (config.required) {
			validators.push(Validators.required);
			messages[ValidationErrorKey.required] =
				`${config.label} is <strong>required</strong>`;
		}

		// Add URL validation if inputType is url
		if (config.inputType === "url") {
			validators.push(this.validationService.createUrlValidator());
			messages[ValidationErrorKey.invalidUrl] =
				this.validationService.messages.invalidUrl;
			messages[ValidationErrorKey.notHttps] =
				this.validationService.messages.notHttps;

			// Add file extension validation if specified
			if (config.urlFileExtension) {
				validators.push(
					this.validationService.getFileExtensionValidator(
						config.urlFileExtension,
					),
				);
				messages[ValidationErrorKey.invalidFileUrl] =
					this.validationService.messages.invalidFileUrl(
						config.urlFileExtension,
					);
			}
		}

		return {
			...config,
			type: "text",
			inputType: config.inputType || "text",
			validators,
			validationMessages: messages,
		} as const;
	}

	/**
	 * Creates a configured file field with validations
	 */
	createFileField(config: Omit<FileFieldConfig, "type">): FileFieldConfig {
		const validators: ValidatorFn[] = config.validators
			? [...config.validators]
			: [];
		const messages: Record<string, string> = {
			...config.validationMessages,
		};

		if (!config.accept?.length) {
			throw new Error("Accept array must contain at least one file type");
		}

		if (typeof config.onFileSelected !== "function") {
			throw new Error("onFileSelected must be a valid function");
		}

		if (config.required) {
			validators.push(Validators.required);
			messages[ValidationErrorKey.required] =
				this.validationService.messages.required(config.label);
		}

		return {
			...config,
			type: "file",
			validators,
			validationMessages: messages,
		} as const;
	}

	/**
	 * Creates a FormGroup based on configured fields and initial data
	 */
	createFormGroup(
		fields: FormFieldConfig[],
		initialData: Record<string, any> = {},
	): FormGroup {
		const group: Record<string, FormControl> = {};

		// Create controls from initial data
		for (const [key, value] of Object.entries(initialData)) {
			group[key] = new FormControl(value);
		}

		// Configure validators for each field
		for (const field of fields) {
			const control = group[field.key] || new FormControl(null);
			control.setValidators(field.validators || null);
			group[field.key] = control;
		}

		return new FormGroup(group);
	}

	/**
	 * Extracts YouTube video ID from URL
	 */
	extractYouTubeVideoId = (url: string): string => {
		for (const pattern of this.validationService.patterns.youtube) {
			const match = url.match(pattern);
			if (match?.[1]) return match[1];
		}
		return url;
	};
}
