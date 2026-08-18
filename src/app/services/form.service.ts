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

export interface InvalidControlInfo {
	errors: ValidationErrors;
	invalid: boolean;
	value?: unknown;
}

interface BaseFieldConfig {
	key: string;
	label: string;
	required?: boolean;
	hint?: string;
	disabled?: boolean;
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

export interface SelectOption<V = unknown> {
	value: V;
	label: string;
}

export interface SelectFieldConfig<V = unknown> extends BaseFieldConfig {
	readonly type: "select";
	options: SelectOption<V>[];
	placeholder?: string;
	onChange?: (value: V | null) => void;
}

export type FormFieldConfig =
	| TextFieldConfig
	| FileFieldConfig
	| SelectFieldConfig<any>;

/**
 * Maps a form values interface to a typed `FormGroup` controls map.
 * Declare your form's values as an interface and pass it as the generic:
 *
 * ```ts
 * interface DetailsForm { name: string; genre: Genre | null; }
 * form = formService.createFormGroup<DetailsForm>(fields, initial);
 * // form.controls.name -> FormControl<string>, form.value -> DetailsForm
 * ```
 */
export type ValuesToControls<T extends object> = {
	[K in keyof T]: FormControl<T[K]>;
};

export type FormSubmissionResult<V> =
	| { readonly isValid: true; readonly formValue: V }
	| {
			readonly isValid: false;
			readonly invalidControls?: Record<string, InvalidControlInfo>;
			readonly error?: Error;
		};

interface FormSubmissionConfig<
	V extends object = Record<string, unknown>,
> {
	onValidSubmit?: (formValue: V) => Promise<void> | void;
	onInvalidSubmit?: (
		invalidControls: Record<string, InvalidControlInfo>,
	) => void;
	enableDebugLogging?: boolean;
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
		};
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
		};
	}

	createSelectField<V>(
		config: Omit<SelectFieldConfig<V>, "type">,
	): SelectFieldConfig<V> {
		const validators: ValidatorFn[] = config.validators
			? [...config.validators]
			: [];
		const messages: Record<string, string> = {
			...config.validationMessages,
		};

		if (config.required) {
			validators.push(Validators.required);
			messages[ValidationErrorKey.required] =
				this.validationService.messages.required(config.label);
		}

		return {
			...config,
			type: "select",
			validators,
			validationMessages: messages,
		};
	}

	createFormGroup<V extends object>(
		fields: readonly FormFieldConfig[],
		initialData: Partial<V> = {},
	): FormGroup<ValuesToControls<V>> {
		const controls: Record<string, FormControl> = {};
		for (const field of fields) {
			const control = new FormControl(
				initialData[field.key as keyof V] ?? null,
				{
					validators: field.validators?.length
						? field.validators
						: null,
				},
			);
			if (field.disabled) control.disable();
			controls[field.key] = control;
		}
		return new FormGroup(controls as ValuesToControls<V>);
	}

	private async processTextFieldValues<V extends object>(
		form: FormGroup<ValuesToControls<V>>,
		fields: readonly FormFieldConfig[],
	): Promise<void> {
		for (const field of fields) {
			if (field.type === "text" && field.onValueProcessed) {
				const control = (form.controls as Record<string, FormControl>)[
					field.key
				];
				const value = control.value as string;
				if (value == null || value === "") continue;
				const processedValue = await field.onValueProcessed(value);
				if (processedValue) control.setValue(processedValue);
			}
		}
	}

	private async processFileFieldValues<V extends object>(
		form: FormGroup<ValuesToControls<V>>,
		fields: readonly FormFieldConfig[],
	): Promise<void> {
		for (const field of fields) {
			if (field.type === "file" && field.onFileSelected) {
				const control = (form.controls as Record<string, FormControl>)[
					field.key
				];
				const file = control.value as File | null;
				if (file) field.onFileSelected(file);
			}
		}
	}

	private collectInvalidControls<V extends object>(
		form: FormGroup<ValuesToControls<V>>,
	): Record<string, InvalidControlInfo> {
		const invalidControls: Record<string, InvalidControlInfo> = {};
		for (const key of Object.keys(form.controls)) {
			const control = (form.controls as Record<string, FormControl>)[key];
			control.markAsTouched();
			control.markAsDirty();
			if (control.errors) {
				invalidControls[key] = {
					errors: control.errors,
					invalid: control.invalid,
					value: control.value,
				};
			}
		}
		return invalidControls;
	}

	private async handleFormSubmission<
		V extends object,
	>(
		form: FormGroup<ValuesToControls<V>>,
		fields: readonly FormFieldConfig[],
		config: FormSubmissionConfig<V> = {},
	): Promise<FormSubmissionResult<V>> {
		const {
			onValidSubmit,
			onInvalidSubmit,
			enableDebugLogging = false,
		} = config;
		try {
			if (form.valid) {
				await this.processTextFieldValues<V>(form, fields);
				await this.processFileFieldValues<V>(form, fields);
				const formValue = form.getRawValue() as V;
				if (onValidSubmit) await onValidSubmit(formValue);
				if (enableDebugLogging)
					console.log("Form value to submit:", formValue);
				return { isValid: true, formValue };
			} else {
				const invalidControls = this.collectInvalidControls<V>(form);
				if (onInvalidSubmit) onInvalidSubmit(invalidControls);
				if (enableDebugLogging)
					console.error("Form is invalid, cannot submit.");
				return { isValid: false, invalidControls };
			}
		} catch (error) {
			if (enableDebugLogging)
				console.error("Error during form submission:", error);
			return { isValid: false, error: error as Error };
		}
	}

	async submitForm<V extends object>(
		fields: readonly FormFieldConfig[],
		form: FormGroup<ValuesToControls<V>>,
		enableDebugLogging = false,
	): Promise<FormSubmissionResult<V>> {
		return this.handleFormSubmission<V>(form, fields, {
			enableDebugLogging,
		});
	}
}