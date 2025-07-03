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
	private decodeService = inject(DecodeService);
	private extractService = inject(ExtractService);

	// Get section HTML component reference
	readonly container = viewChild.required<ElementRef>("container");
	readonly onFileDecoded = output<any | null>();

	private _snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);

	readonly control = input<InputSignal<FormControl | null>>();
	readonly title = input<string>("Upload File");
	readonly accept = input<string[]>([".chart", ".zip"]);
	readonly isInvalid = input.required<boolean | undefined>();

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
			this.processFiles(event.dataTransfer.files);
		}

		// Remove visual feedback
		this.container().nativeElement.classList.remove("drag-over");
	}

	processFiles(files: FileList): void {
		const acceptedTypes = this.accept();
		Array.from(files).forEach((file) => {
			const isAccepted = acceptedTypes.some((type) =>
				file.name.endsWith(type),
			);
			if (!isAccepted) {
				console.error("Invalid file type:", file.name);
				this.onInvalidFile();
				return;
			}
			if (file.name.endsWith(".chart")) {
				this.extractChartInfo(file);
			} else if (file.name.endsWith(".zip")) {
				this.extractBundleZipData(file);
			} else {
				console.log("File accepted:", file.name);
				this.currentFileName.set(file.name);
				this.onFileDecoded.emit(file);
			}
		});
	}

	extractChartInfo(file: File): void {
		const data = this.decodeService.decodeChartFile(file);
		data.then((chartData) => {
			console.log("Chart data:", chartData);
			this.currentFileName.set(file.name);
			this.onFileDecoded.emit(chartData);
		}).catch((error) => {
			console.error("Failed to extract chart data:", error);
			this.onFileDecoded.emit(null);
			this.dialog.open(ErrorDialogComponent, {
				data: {
					error,
				},
			});
		});
	}

	extractBundleZipData(file: File): void {
		this.extractService
			.extractBundleZipData(file)
			.then((data) => {
				console.log("Bundle data:", data);
				this.currentFileName.set(file.name);
				this.onFileDecoded.emit(data);
			})
			.catch((error) => {
				console.error("Failed to extract bundle data:", error);
				this.onFileDecoded.emit(null);
				this.dialog.open(ErrorDialogComponent, {
					data: {
						error,
					},
				});
			});
	}
}
