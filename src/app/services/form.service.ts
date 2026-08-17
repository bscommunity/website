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
	ValidationErrors,
} from "@angular/forms";

interface InvalidControlInfo {
	errors: ValidationErrors;
	invalid: boolean;
	value?: unknown;
}

interface BaseFieldConfig {
	key: string;
	label: string;
	required?: boolean;
	hint?: string;
	validators?: ValidatorFn[];
	validationMessages?: Record<string, string>;
}

export interface TextFieldConfig extends BaseFieldConfig {
	readonly type: "text";
	placeholder?: string;
	inputType?: TextInputType;
	onValueProcessed?: (value: string) => Promise<void> | string;
	urlFileExtension?: string;
}

export interface FileFieldConfig extends BaseFieldConfig {
	readonly type: "file";
	accept: (FileType | string)[];
	onFileSelected?: (data: File) => void;
}

export type FormFieldConfig = TextFieldConfig | FileFieldConfig;

export interface FormSubmissionConfig {
	onValidSubmit?: (
		formValue: Record<string, unknown>,
	) => Promise<void> | void;
	onInvalidSubmit?: (
		invalidControls: Record<string, InvalidControlInfo>,
	) => void;
	enableDebugLogging?: boolean;
}

export interface FormSubmissionResult {
	isValid: boolean;
	formValue?: Record<string, unknown>;
	invalidControls?: Record<string, InvalidControlInfo>;
	error?: Error;
}

@Injectable({ providedIn: "root" })
export class FormService {
	private validationService = inject(ValidationService);

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

		if (config.inputType === "url") {
			validators.push(this.validationService.createUrlValidator());
			messages[ValidationErrorKey.invalidUrl] =
				this.validationService.messages.invalidUrl;
			messages[ValidationErrorKey.notHttps] =
				this.validationService.messages.notHttps;
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

	createFormGroup(
		fields: FormFieldConfig[],
		initialData: object = {},
	): FormGroup {
		const group: Record<string, FormControl> = {};
		for (const [key, value] of Object.entries(initialData)) {
			group[key] = new FormControl(value);
		}
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
					const value = control.value as string;
					// Skip processing if the field is empty (optional field with no input)
					if (value == null || value === "") continue;
					const processedValue = await field.onValueProcessed(value);
					if (processedValue) control.setValue(processedValue);
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
					if (file) field.onFileSelected(file);
				}
			}
		}
	}

	// YouTube ID extraction agora centralizada em ValidationService.extractYouTubeVideoId

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
		if (enableDebugLogging) console.log("Trying to submit form");
		try {
			if (form.valid) {
				if (enableDebugLogging)
					console.log("Form is valid, submitting...");
				await this.processTextFieldValues(form, fields);
				await this.processFileFieldValues(form, fields);
				if (onValidSubmit) await onValidSubmit(form.value);
				const formValue = { ...form.value };
				if (enableDebugLogging)
					console.log("Form value to submit:", formValue);
				return { isValid: true, formValue };
			} else {
				const invalidControls: Record<string, InvalidControlInfo> = {};
				Object.keys(form.controls).forEach((key) => {
					const control = form.get(key);
					control?.markAsTouched();
					control?.markAsDirty();
					if (control?.errors) {
						invalidControls[key] = {
							errors: control.errors,
							invalid: control.invalid,
							value: control.value,
						};
						if (enableDebugLogging)
							console.log(
								`${key}: errors:`,
								control.errors,
								control.invalid,
							);
					}
				});
				if (enableDebugLogging)
					console.error("Form is invalid, cannot submit.");
				if (onInvalidSubmit) onInvalidSubmit(invalidControls);
				return { isValid: false, invalidControls };
			}
		} catch (error) {
			if (enableDebugLogging)
				console.error("Error during form submission:", error);
			return { isValid: false, error: error as Error };
		}
	}

	getInvalidControls(form: FormGroup): Record<string, InvalidControlInfo> {
		const invalidControls: Record<string, InvalidControlInfo> = {};
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

	async submitForm(
		form: FormGroup,
		fields: FormFieldConfig[],
		enableDebugLogging = false,
	): Promise<FormSubmissionResult> {
		return this.handleFormSubmission(form, fields, { enableDebugLogging });
	}

	async submitFormWithValidation(
		form: FormGroup,
		fields: FormFieldConfig[],
		validationCallback: (
			formValue: Record<string, unknown>,
		) => Promise<void> | void,
		enableDebugLogging = false,
	): Promise<FormSubmissionResult> {
		return this.handleFormSubmission(form, fields, {
			onValidSubmit: validationCallback,
			enableDebugLogging,
		});
	}
}
