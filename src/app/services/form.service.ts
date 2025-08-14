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
	onValueProcessed?: (value: string) => Promise<void> | string;
	urlFileExtension?: string;
}

/**
 * File field configuration
 */
export interface FileFieldConfig extends BaseFieldConfig {
	readonly type: "file";
	accept: (FileType | string)[];
	onFileSelected?: (data: File) => void;
}

/**
 * Union type for any form field configuration
 */
export type FormFieldConfig = TextFieldConfig | FileFieldConfig;

/**
 * Configuration for form submission
 */
export interface FormSubmissionConfig {
	/**
	 * Custom processing function executed when form is valid
	 */
	onValidSubmit?: (formValue: any) => Promise<void> | void;
	/**
	 * Custom processing function executed when form is invalid
	 */
	onInvalidSubmit?: (invalidControls: Record<string, any>) => void;
	/**
	 * Whether to log debug information
	 */
	enableDebugLogging?: boolean;
}

/**
 * Result of form submission processing
 */
export interface FormSubmissionResult {
	isValid: boolean;
	formValue?: any;
	invalidControls?: Record<string, any>;
	error?: Error;
}

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

		/* if (typeof config.onFileSelected !== "function") {
			throw new Error("onFileSelected must be a valid function");
		} */

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

	async processTextFieldValues(
		form: FormGroup,
		fields: FormFieldConfig[],
	): Promise<void> {
		for (const field of fields) {
			if (field.type === "text" && field.onValueProcessed) {
				const control = form.get(field.key);
				if (control instanceof FormControl) {
					const processedValue = await field.onValueProcessed(
						control.value as string,
					);
					if (processedValue) {
						control.setValue(processedValue);
					}
				}
			}
		}
	}

	async processFileFieldValues(
		form: FormGroup,
		fields: FormFieldConfig[],
	): Promise<void> {
		for (const field of fields) {
			if (field.type === "file" && field.onFileSelected) {
				const control = form.get(field.key);
				if (control instanceof FormControl) {
					const file = control.value;
					if (file) {
						field.onFileSelected(file);
					}
				}
			}
		}
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

	/**
	 * Generic form submission handler
	 */
	async handleFormSubmission(
		form: FormGroup,
		fields: FormFieldConfig[],
		config: FormSubmissionConfig = {},
	): Promise<FormSubmissionResult> {
		const {
			onValidSubmit,
			onInvalidSubmit,
			enableDebugLogging = false,
		} = config;

		if (enableDebugLogging) {
			console.log("Trying to submit form");
		}

		try {
			if (form.valid) {
				if (enableDebugLogging) {
					console.log("Form is valid, submitting...");
				}

				// Process text field values
				await this.processTextFieldValues(form, fields);

				// Process file field values
				await this.processFileFieldValues(form, fields);

				// Execute custom validation logic if provided
				if (onValidSubmit) {
					await onValidSubmit(form.value);
				}

				// Get updated form value after processing
				const formValue = { ...form.value };

				if (enableDebugLogging) {
					console.log("Form value to submit:", formValue);
				}

				return {
					isValid: true,
					formValue,
				};
			} else {
				// Handle invalid form
				const invalidControls: Record<string, any> = {};

				Object.keys(form.controls).forEach((key) => {
					const control = form.get(key);
					if (control?.errors) {
						invalidControls[key] = {
							errors: control.errors,
							invalid: control.invalid,
						};

						if (enableDebugLogging) {
							console.log(
								`${key}: errors:`,
								control.errors,
								control.invalid,
							);
						}

						// Mark control as touched and dirty to trigger validation messages
						control.markAsTouched();
						control.markAsDirty();
					}
				});

				if (enableDebugLogging) {
					console.error("Form is invalid, cannot submit.");
				}

				// Execute custom invalid submission logic if provided
				if (onInvalidSubmit) {
					onInvalidSubmit(invalidControls);
				}

				return {
					isValid: false,
					invalidControls,
				};
			}
		} catch (error) {
			if (enableDebugLogging) {
				console.error("Error during form submission:", error);
			}

			return {
				isValid: false,
				error: error as Error,
			};
		}
	}

	/**
	 * Helper method to get all invalid controls with their errors
	 */
	getInvalidControls(form: FormGroup): Record<string, any> {
		const invalidControls: Record<string, any> = {};

		Object.keys(form.controls).forEach((key) => {
			const control = form.get(key);
			if (control?.errors) {
				invalidControls[key] = {
					errors: control.errors,
					invalid: control.invalid,
					value: control.value,
				};
			}
		});

		return invalidControls;
	}

	/**
	 * Simple form submission handler without custom processing
	 */
	async submitForm(
		form: FormGroup,
		fields: FormFieldConfig[],
		enableDebugLogging: boolean = false,
	): Promise<FormSubmissionResult> {
		return this.handleFormSubmission(form, fields, { enableDebugLogging });
	}

	/**
	 * Form submission handler with custom validation callback
	 */
	async submitFormWithValidation(
		form: FormGroup,
		fields: FormFieldConfig[],
		validationCallback: (formValue: any) => Promise<void> | void,
		enableDebugLogging: boolean = false,
	): Promise<FormSubmissionResult> {
		return this.handleFormSubmission(form, fields, {
			onValidSubmit: validationCallback,
			enableDebugLogging,
		});
	}
}
