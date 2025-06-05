import { ChartFileData, DecodeService } from "@/services/decode.service";
import {
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Output,
	signal,
	ViewChild,
} from "@angular/core";

import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";

// Components
import { UploadDialogErrorComponent } from "../upload/generic/error.component";

@Component({
	selector: "app-file-upload",
	imports: [MatButtonModule],
	templateUrl: "./file-upload.component.html",
	styleUrl: "./file-upload.component.scss",
})
export class FileUploadComponent {
	private decodeService = inject(DecodeService);


	// Get section HTML component reference
	@ViewChild("container") container!: ElementRef;
	@Output() onFileDecoded = new EventEmitter<ChartFileData | null>();

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
		Array.from(files).forEach((file) => {
			if (file.name.endsWith(".chart")) {
				this.extractInfo(file);
			} else {
				console.error("Invalid file type:", file.name);
				this.onInvalidFile();
			}
		});
	}

	extractInfo(file: File): void {
		const data = this.decodeService.decodeChartFile(file);
		data.then((chartData) => {
			console.log("Chart data:", chartData);
			this.currentFileName.set(file.name);
			this.onFileDecoded.emit(chartData);
		}).catch((error) => {
			console.error("Failed to extract chart data:", error);
			this.onFileDecoded.emit(null);
			this.dialog.open(UploadDialogErrorComponent, {
				data: {
					error,
				},
			});
		});
	}
}
