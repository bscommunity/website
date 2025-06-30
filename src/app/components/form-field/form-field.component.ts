import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

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
export class FormFieldComponent {
	readonly config = input.required<FormFieldConfig>();
	readonly control = input.required<any | null>();

	// Computed properties
	fieldErrors = computed(() => {
		if (this.control().valid) return [];

		const errors = this.control()?.errors;
		console.log(`Errors from ${this.config().key}: `, errors);

		return Object.entries(errors).map(([key, _]) => ({
			key,
			message: this.config().validationMessages?.[key] || `${key} error`,
		}));
	});

	getTextConfig(): TextFieldConfig {
		// console.log((this.config() as TextFieldConfig).formControlName);
		return this.config() as TextFieldConfig;
	}

	getFileConfig(): FileFieldConfig {
		return this.config() as FileFieldConfig;
	}
}
