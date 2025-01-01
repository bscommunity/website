// biome-ignore lint/style/useImportType: ElementRef is used as dependency injection token
import {
	Component,
	Input,
	HostListener,
	ElementRef,
	ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

export interface Option {
	value: string;
	viewValue: string;
	icon: string;
}

@Component({
	selector: "app-custom-select",
	imports: [CommonModule, MatIconModule],
	templateUrl: "./custom-select.component.html",
	styleUrls: ["./custom-select.component.scss"],
})
export class CustomSelectComponent {
	constructor(
		private elementRef: ElementRef,
		private cdr: ChangeDetectorRef,
	) {}

	@Input() options: Option[] = [];
	@Input() defaultOption: Option | null = null;
	selectedOption: Option | null = this.defaultOption;
	dropdownOpen = false;

	selectOption(option: Option) {
		this.selectedOption = option;
		/* setTimeout(() => {
			this.dropdownOpen = false;
		}, 0); */
		this.dropdownOpen = false;
		this.cdr.detectChanges(); // Manually trigger change detection
	}

	toggleDropdown() {
		this.dropdownOpen = !this.dropdownOpen;
	}

	@HostListener("document:click", ["$event"])
	onDocumentClick(event: Event) {
		if (!this.elementRef.nativeElement.contains(event.target)) {
			this.dropdownOpen = false;
		}
	}
}
