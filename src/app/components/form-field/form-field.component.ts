import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	signal,
} from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";

// Components
import { MatFormFieldModule } from "@angular/material/form-field";
import {
	MatError,
	MatHint,
	MatInputModule,
	MatLabel,
} from "@angular/material/input";
import { FileFieldComponent } from "@/components/file-field/file-field.component";

// Types
import type {
	FileFieldConfig,
	FormFieldConfig,
	TextFieldConfig,
} from "@/services/form.service";

@Component({
	selector: "app-form-field",
	standalone: true,
	templateUrl: "./form-field.component.html",
	imports: [
		MatFormFieldModule,
		ReactiveFormsModule,
		MatInputModule,
		MatError,
		MatLabel,
		MatHint,
		FileFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormFieldComponent {
	readonly config = input.required<FormFieldConfig>();
	readonly formGroup = input.required<FormGroup>();
	readonly showValidation = input(false);

	// File upload state tracking
	private fileState = signal<{
		hasFile: boolean;
		isValid: boolean;
		isProcessed: boolean;
	}>({
		hasFile: false,
		isValid: false,
		isProcessed: false,
	});

	// Computed properties
	fieldErrors = computed(() => {
		if (this.config().type !== "text") return [];

		const textConfig = this.getTextConfig();
		const control = this.formGroup().get(textConfig.formControlName);

		if (!control?.errors || !control.touched) return [];

		return Object.entries(control.errors).map(([key, _]) => ({
			key,
			message: textConfig.validationMessages?.[key] || `${key} error`,
		}));
	});

	fileErrorMessage = computed(() => {
		const state = this.fileState();
		const config = this.config();
		if (!state.hasFile && config.required) {
			return `${config.label} is <strong>required</strong>`;
		}
		if (state.hasFile && !state.isValid) {
			return `Invalid ${config.label.toLowerCase()} format`;
		}
		return "";
	});

	getTextConfig(): TextFieldConfig {
		return this.config() as TextFieldConfig;
	}

	getFileConfig(): FileFieldConfig {
		return this.config() as FileFieldConfig;
	}

	handleFileUpload(data: any): void {
		const isValid = data !== null;
		this.fileState.set({
			hasFile: true,
			isValid,
			isProcessed: isValid,
		});

		if (isValid) {
			// Process file and update form fields
			this.getFileConfig().onFileProcessed(data, this.formGroup());
		}
	}

	hasFileError(): boolean {
		const config = this.config();
		if (!this.showValidation() || config.type !== "file") return false;

		const state = this.fileState();
		const required = config.required ?? false;

		return required
			? !state.hasFile || !state.isValid
			: state.hasFile && !state.isValid;
	}

	// Public method to check if file has been processed
	isFileProcessed(): boolean {
		return this.config().type === "file"
			? this.fileState().isProcessed
			: true;
	}
}
