import {
	Component,
	ElementRef,
	inject,
	output,
	viewChild,
	input,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
	selector: "app-file-field",
	imports: [MatButtonModule, ReactiveFormsModule, CommonModule],
	templateUrl: "./file-field.component.html",
	styleUrl: "./file-field.component.css",
})
export class FileFieldComponent {
	// Get section HTML component reference
	readonly container = viewChild.required<ElementRef>("container");

	private _snackBar = inject(MatSnackBar);

	readonly key = input.required<string>();
	readonly title = input.required<string>();
	readonly accept = input<string[]>([".chart", ".zip"]);
	readonly isInvalid = input.required<boolean | undefined>();
	readonly fileName = input<string | null | undefined>();
	readonly sizeLimit = input<number | null>(10); // Size limit in MB

	readonly fileChange = output<File>();

	onInvalidFile(): void {
		this._snackBar.open("Invalid file type", "Close", {
			duration: 2000,
		});
	}

	onSizeLimitExceeded(): void {
		this._snackBar.open(
			`File size exceeds the limit (${this.sizeLimit()}mb)`,
			"Close",
			{
				duration: 2000,
			},
		);
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		// Optionally add visual feedback
		this.container().nativeElement.classList.add("drag-over");
	}

	onDragLeave(event: DragEvent): void {
		event.preventDefault();
		// Remove visual feedback
		this.container().nativeElement.classList.remove("drag-over");
	}

	validate(file: File | null | undefined): boolean {
		if (!file) {
			this.onInvalidFile();
			return false;
		}

		// console.log("Type:", file.type);
		// console.log("Accept:", this.accept());

		// Validate file type
		if (!this.accept().some((type) => file.name.endsWith(type))) {
			this.onInvalidFile();
			return false;
		}

		// Check file size limit
		if (this.sizeLimit() && file.size > this.sizeLimit()! * 1024 * 1024) {
			this.onSizeLimitExceeded();
			return false;
		}

		return true;
	}

	onChange(file: File): void {
		if (!this.validate(file)) return;
		this.fileChange.emit(file);
	}

	onDrop(event: DragEvent): void {
		event.preventDefault();
		this.onDragLeave(event);

		const file = event.dataTransfer?.files.item(0);

		if (!this.validate(file)) return;

		this.fileChange.emit(file!);

		// Remove visual feedback
		this.container().nativeElement.classList.remove("drag-over");
	}
}
