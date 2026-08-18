import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	inject,
	input,
	OnDestroy,
	OnInit,
	signal,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
	MatError,
	MatHint,
	MatInputModule,
	MatLabel,
} from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import type { Subscription } from "rxjs";

// Components
import { FileFieldComponent } from "@/components/file-field/file-field.component";

// Types
import type {
	FileFieldConfig,
	FormFieldConfig,
	SelectFieldConfig,
	SelectOption,
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
		MatSelectModule,
		FileFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent implements OnInit, OnDestroy {
	readonly config = input.required<FormFieldConfig>();
	readonly control = input.required<FormControl>();
	readonly options = input<readonly SelectOption[] | undefined>(undefined);

	private readonly cdr = inject(ChangeDetectorRef);

	/** Tracks the control's status so the error message recomputes reactively. */
	private readonly status = signal<string | null>(null);
	private statusSubscription: Subscription | null = null;

	readonly errorMessage = computed(() => {
		this.status();
		const control = this.control();
		const config = this.config();
		if (control.valid || !control.errors) return "";
		const messages = config.validationMessages;
		const firstKey = Object.keys(control.errors)[0];
		return (messages && messages[firstKey]) || `${firstKey} error`;
	});

	ngOnInit() {
		const control = this.control();
		this.status.set(control.status);
		this.statusSubscription = control.statusChanges.subscribe(() => {
			this.status.set(control.status);
			this.cdr.markForCheck();
		});
	}

	ngOnDestroy() {
		this.statusSubscription?.unsubscribe();
		this.statusSubscription = null;
	}

	getTextConfig(): TextFieldConfig {
		return this.config() as TextFieldConfig;
	}

	getFileConfig(): FileFieldConfig {
		return this.config() as FileFieldConfig;
	}

	getSelectConfig(): SelectFieldConfig {
		return this.config() as SelectFieldConfig;
	}

	onBlur() {
		this.control().markAsTouched();
		this.cdr.markForCheck();
	}

	onSelectionChange() {
		const control = this.control();
		control.markAsTouched();
		this.getSelectConfig().onChange?.(control.value as never);
		this.cdr.markForCheck();
	}

	onFileChange(file: File) {
		this.control().setValue(file);
		this.cdr.markForCheck();
	}
}