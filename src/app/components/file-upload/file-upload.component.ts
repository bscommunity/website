import { ChartFileData, DecodeService } from "@/services/decode.service";
import {
	Component,
	ElementRef,
	EventEmitter,
	forwardRef,
	inject,
	Input,
	Output,
	signal,
	ViewChild,
} from "@angular/core";

import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";

// Components
import { UploadDialogErrorComponent } from "../upload/generic/error.component";
import {
	ControlValueAccessor,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
} from "@angular/forms";

@Component({
	selector: "app-file-upload",
	templateUrl: "./file-upload.component.html",
	styleUrl: "./file-upload.component.scss",
	imports: [MatButtonModule, ReactiveFormsModule],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => FileUploadComponent),
			multi: true,
		},
	],
})
export class FileUploadComponent implements ControlValueAccessor {
	constructor(private decodeService: DecodeService) {}

	// Form value
	private _value: File | null = null;

	// ControlValueAccessor callbacks
	private onChange: (value: File | null) => void = () => {};
	private onTouched: () => void = () => {};

	// Update the file value and propagate changes
	writeValue(value: File | null): void {
		this._value = value;
	}

	registerOnChange(fn: (value: File | null) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		// Handle the disabled state if necessary
	}

	// Get section HTML component reference
	@ViewChild("container") container!: ElementRef;
	@Input() formControlName!: string;

	private _snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);

	currentFileName = signal<string | null>(null);

	onInvalidFile(): void {
		this._snackBar.open("Invalid file type", "Close", {
			duration: 2000,
		});
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			this.processFiles(input.files);
		}
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		// Optionally add visual feedback
		this.container.nativeElement.classList.add("drag-over");
	}

	onDragLeave(event: DragEvent): void {
		event.preventDefault();
		// Remove visual feedback
		this.container.nativeElement.classList.remove("drag-over");
	}

	onDrop(event: DragEvent): void {
		event.preventDefault();
		if (event.dataTransfer?.files) {
			this.processFiles(event.dataTransfer.files);
		}

		// Remove visual feedback
		this.container.nativeElement.classList.remove("drag-over");
	}

	processFiles(files: FileList): void {
		const file = files[0];
		if (file && file.name.endsWith(".chart")) {
			this.extractInfo(file);
			this._value = file;
			this.onChange(file); // Notify parent form of the change
		} else {
			this.onInvalidFile();
		}
	}

	extractInfo(file: File): void {
		const data = this.decodeService.decodeChartFile(file);
		data.then((chartData) => {
			console.log("Chart data:", chartData);
			this.currentFileName.set(file.name);
		}).catch((error) => {
			console.error("Failed to extract chart data:", error);
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					error,
				},
			});
		});
	}
}
