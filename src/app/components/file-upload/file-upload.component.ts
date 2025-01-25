import { DecodeService } from "@/services/decode.service";
import { Component, ElementRef, inject, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UploadDialogErrorComponent } from "../upload/generic/error.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
	selector: "app-file-upload",
	imports: [MatButtonModule],
	templateUrl: "./file-upload.component.html",
	styleUrl: "./file-upload.component.scss",
})
export class FileUploadComponent {
	constructor(private decodeService: DecodeService) {}

	// Get section HTML component reference
	@ViewChild("container") container!: ElementRef;

	private _snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);

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
