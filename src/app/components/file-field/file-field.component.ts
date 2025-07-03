import {
	Component,
	ElementRef,
	inject,
	signal,
	output,
	viewChild,
	input,
	InputSignal,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";

// Components
import { ErrorDialogComponent } from "../dialogs/error.component";

// Services
import { DecodeService } from "@/services/decode.service";
import { ExtractService } from "@/services/extract.service";

@Component({
	selector: "app-file-field",
	imports: [MatButtonModule, ReactiveFormsModule, CommonModule],
	templateUrl: "./file-field.component.html",
	styleUrl: "./file-field.component.css",
})
export class FileFieldComponent {
	// Get section HTML component reference
	readonly container = viewChild.required<ElementRef>("container");
	readonly onFileDecoded = output<any | null>();

	private _snackBar = inject(MatSnackBar);

	readonly control = input.required<FormControl | null>();
	readonly title = input<string>("Upload File");
	readonly isInvalid = input.required<boolean | undefined>();

	fileName = signal<string | null>(null);

	onInvalidFile(): void {
		this._snackBar.open("Invalid file type", "Close", {
			duration: 2000,
		});
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

	onDrop(event: DragEvent): void {
		event.preventDefault();
		if (event.dataTransfer?.files) {
			this.control()?.setValue(event.dataTransfer.files[0]);
			console.log(this.control()?.errors);
			this.fileName.set(event.dataTransfer.files[0].name);
		}

		// Remove visual feedback
		this.container().nativeElement.classList.remove("drag-over");
	}
}
