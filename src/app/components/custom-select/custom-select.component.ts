import {
	Component,
	Input,
	HostListener,
	ElementRef,
	ChangeDetectorRef,
	Renderer2,
	ViewChild,
	AfterViewInit,
	Output,
	EventEmitter,
	Inject,
	PLATFORM_ID,
	OnDestroy,
} from "@angular/core";

import { fromEvent, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { CommonModule, isPlatformBrowser } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";

export interface Option {
	value: string;
	label: string;
	icon?: string;
}

@Component({
	selector: "app-custom-select",
	imports: [CommonModule, MatIconModule, MatRippleModule],
	templateUrl: "./custom-select.component.html",
})
export class CustomSelectComponent implements AfterViewInit, OnDestroy {
	@ViewChild("dropdown") dropdown!: ElementRef;

	constructor(
		@Inject(PLATFORM_ID) private platformId: object,
		private renderer: Renderer2,
		private elementRef: ElementRef,
		private cdr: ChangeDetectorRef,
	) {}

	@Input() class = "";
	@Input() disabled = false;

	@Input() options: Option[] = [];
	@Input() selectedOption: Option | null = null;
	@Output() selectionChange = new EventEmitter<Option>();

	dropdownOpen = false;
	dropdownSide: "up" | "down" = "down";
	highlightedIndex = -1;

	adjustDropdownPosition() {
		if (typeof window === "undefined") {
			return;
		}

		const triggerRect =
			this.elementRef.nativeElement.getBoundingClientRect();
		const dropdown = this.dropdown.nativeElement;
		const dropdownHeight = dropdown.offsetHeight;
		const viewportHeight = window.innerHeight;

		const spaceBelow = viewportHeight - triggerRect.bottom;
		const spaceAbove = triggerRect.top;

		if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
			// Position above
			this.renderer.setStyle(
				dropdown,
				"bottom",
				`${triggerRect.height}px`,
			);
			this.renderer.setStyle(dropdown, "top", "auto");
			this.dropdownSide = "up";
		} else {
			// Position below
			this.renderer.setStyle(dropdown, "top", `${triggerRect.height}px`);
			this.renderer.setStyle(dropdown, "bottom", "auto");
			this.dropdownSide = "down";
		}

		// Adjust width to match trigger element
		this.renderer.setStyle(dropdown, "width", `${triggerRect.width}px`);

		// Ensure dropdown doesn't overflow viewport
		const dropdownRect = dropdown.getBoundingClientRect();
		if (dropdownRect.bottom > viewportHeight) {
			const overflow = dropdownRect.bottom - viewportHeight;
			this.renderer.setStyle(
				dropdown,
				"max-height",
				`${dropdownHeight - overflow}px`,
			);
		}
	}

	resizeSubscription: Subscription = new Subscription();
	scrollSubscription: Subscription = new Subscription();

	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			this.resizeSubscription = fromEvent(window, "resize")
				.pipe(debounceTime(200))
				.subscribe(() => {
					if (this.dropdownOpen) {
						this.adjustDropdownPosition();
					}
				});

			this.scrollSubscription = fromEvent(window, "scroll")
				.pipe(debounceTime(200))
				.subscribe(() => {
					if (this.dropdownOpen) {
						this.adjustDropdownPosition();
					}
				});
		}
	}

	ngOnDestroy() {
		if (this.resizeSubscription) this.resizeSubscription.unsubscribe();
		if (this.scrollSubscription) this.scrollSubscription.unsubscribe();
	}

	selectOption(option: Option): void {
		this.selectedOption = option;
		this.selectionChange.emit(option);
		this.highlightedIndex = -1;

		this.dropdownOpen = false;
		this.cdr.detectChanges(); // Manually trigger change detection
	}

	toggleDropdown() {
		this.dropdownOpen = !this.dropdownOpen;
		this.cdr.detectChanges(); // Trigger change detection

		if (this.dropdownOpen) {
			// console.log("Adjusting");
			this.adjustDropdownPosition();
		} else {
			this.highlightedIndex = -1;
		}
	}

	showTopShadow = false;
	showBottomShadow = false;

	onDropdownScroll(event: Event) {
		const element = event.target as HTMLElement;
		const { scrollTop, scrollHeight, clientHeight } = element;

		this.showTopShadow = scrollTop > 0;
		this.showBottomShadow = scrollTop + clientHeight < scrollHeight;
	}

	@HostListener("document:click", ["$event"])
	onDocumentClick(event: Event) {
		if (!this.elementRef.nativeElement.contains(event.target)) {
			this.dropdownOpen = false;
		}
	}

	@HostListener("document:keydown", ["$event"])
	handleKeydown(event: KeyboardEvent) {
		if (this.dropdownOpen) {
			switch (event.key) {
				case "ArrowDown":
					this.highlightedIndex =
						(this.highlightedIndex + 1) % this.options.length;
					event.preventDefault();
					break;
				case "ArrowUp":
					this.highlightedIndex =
						(this.highlightedIndex - 1 + this.options.length) %
						this.options.length;
					event.preventDefault();
					break;
				case "Enter":
					this.selectOption(this.options[this.highlightedIndex]);
					event.preventDefault();
					break;
				case "Escape":
					this.dropdownOpen = false;
					event.preventDefault();
					break;
				case "Tab":
					this.dropdownOpen = false;
					break;
			}
		} else {
			if (event.key === "Enter") {
				this.toggleDropdown();
				event.preventDefault();
			}
		}
	}
}
