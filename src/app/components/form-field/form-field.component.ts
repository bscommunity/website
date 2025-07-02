import {
	ChangeDetectionStrategy,
	Component,
	input,
	signal,
	OnInit,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

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
export class FormFieldComponent implements OnInit {
	readonly config = input.required<FormFieldConfig>();
	readonly control = input.required<FormControl | null>();

	errorMessage = signal("");

	// This is a workaround to avoid using RxJS for Angular Forms
	// Does not works perfectly, only updates when the control is touched or dirty
	/* constructor() {
		effect(() => {
			const control = this.control();
			if (control) {
				// This effect will run whenever control() changes or any of its reactive properties
				this.updateErrorMessage();
			}
		});
	} */

	updateErrorMessage() {
		const control = this.control();

		if (control?.valid || (!control?.touched && !control?.dirty)) {
			this.errorMessage.set("");
			return;
		}

		const errors = control?.errors;
		if (!errors) {
			this.errorMessage.set("");
			return;
		}

		const errorMessages = Object.entries(errors).map(([key, _]) => {
			return this.config().validationMessages?.[key] || `${key} error`;
		});

		console.log(`Errors from ${this.config().key}: `, {
			valid: control?.valid,
			touched: control?.touched,
			dirty: control?.dirty,
			errors: errorMessages,
		});

		this.errorMessage.set(errorMessages[0]);
	}

	onBlur() {
		const control = this.control();
		if (control) {
			control.markAsTouched();
			this.updateErrorMessage();
		}
	}

	ngOnInit() {
		const control = this.control();

		// Listen to Angular form control events without rxjs
		// Since we can't avoid RxJS entirely with Angular Forms, we'll use a minimal approach
		if (control) {
			// Subscribe to value changes (not )
			// control.valueChanges.subscribe(() => this.updateErrorMessage());

			// Subscribe to status changes (for validation state)
			control.statusChanges.subscribe(() => this.updateErrorMessage());
		}

		// Initial error message update
		this.updateErrorMessage();
	}

	getTextConfig(): TextFieldConfig {
		// console.log((this.config() as TextFieldConfig).formControlName);
		return this.config() as TextFieldConfig;
	}

	getFileConfig(): FileFieldConfig {
		return this.config() as FileFieldConfig;
	}
}
