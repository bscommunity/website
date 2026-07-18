import {
	Component,
	HostListener,
	ElementRef,
	Renderer2,
	AfterViewInit,
	PLATFORM_ID,
	OnDestroy,
	input,
	model,
	inject,
	output,
	viewChild,
	effect,
} from "@angular/core";

import { fromEvent, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { CommonModule, isPlatformBrowser } from "@angular/common";
import { MatRippleModule } from "@angular/material/core";
import { NgGlyph } from "@ng-icons/core";

export interface Option {
	value: string;
	label: string;
	icon?: string;
}

@Component({
	selector: "app-select",
	imports: [CommonModule, NgGlyph, MatRippleModule],
	templateUrl: "./select.component.html",
})
export class SelectComponent implements AfterViewInit, OnDestroy {
	private platformId = inject(PLATFORM_ID);
	private renderer = inject(Renderer2);
	private elementRef = inject(ElementRef);

	readonly dropdown = viewChild.required<ElementRef>("dropdown");

	readonly class = input("");
	readonly disabled = input(false);
	readonly defaultValue = input<string | null>(null);

	readonly options = input<Option[]>([]);
	readonly selectedOption = model<Option>();
	readonly selectionChange = output<Option>();

	dropdownOpen = false;
	dropdownSide: "up" | "down" = "down";
	highlightedIndex = -1;
	activeDescendantId = "";

	adjustDropdownPosition() {
		if (typeof window === "undefined") {
			return;
		}

		const triggerRect =
			this.elementRef.nativeElement.getBoundingClientRect();
		const dropdown = this.dropdown().nativeElement;
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
						// console.log("Adjusting on scroll");
						this.adjustDropdownPosition();
					}
				});
		}
	}

	// Initialize selection from defaultValue when provided and no selection yet
	private initDefaultEffect = effect(() => {
		const def = this.defaultValue();
		const options = this.options();
		const selected = this.selectedOption();
		if ((selected == null || !selected.value) && def) {
			const opt = options.find((o) => o.value === def);
			if (opt) {
				this.selectedOption.set(opt);
			}
		}
	});

	ngOnDestroy() {
		if (this.resizeSubscription) this.resizeSubscription.unsubscribe();
		if (this.scrollSubscription) this.scrollSubscription.unsubscribe();
	}

	selectOption(option: Option): void {
		this.selectedOption.set(option);
		this.selectionChange.emit(option);
		this.highlightedIndex = -1;
		this.activeDescendantId = "";

		this.dropdownOpen = false;
		// TODO: Manually trigger change detection?
	}

	toggleDropdown() {
		if (this.disabled()) return;

		this.dropdownOpen = !this.dropdownOpen;

		// TODO: Manually trigger change detection?

		if (this.dropdownOpen) {
			// Set highlighted index to the currently selected option
			const selectedIndex = this.options().findIndex(
				(option) => option.value === this.selectedOption()?.value,
			);
			this.highlightedIndex = selectedIndex >= 0 ? selectedIndex : -1;
			this.activeDescendantId =
				this.highlightedIndex >= 0
					? `option-${this.highlightedIndex}`
					: "";
			// console.log("Adjusting");
			setTimeout(() => this.adjustDropdownPosition(), 0);
		} else {
			this.highlightedIndex = -1;
			this.activeDescendantId = "";
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
		if (!this.elementRef.nativeElement.contains(event.target as Node))
			return;

		if (this.dropdownOpen) {
			switch (event.key) {
				case "ArrowDown":
					this.highlightedIndex =
						(this.highlightedIndex + 1) % this.options().length;
					this.activeDescendantId = `option-${this.highlightedIndex}`;
					event.preventDefault();
					break;
				case "ArrowUp":
					this.highlightedIndex =
						(this.highlightedIndex - 1 + this.options().length) %
						this.options().length;
					this.activeDescendantId = `option-${this.highlightedIndex}`;
					event.preventDefault();
					break;
				case "Enter":
					this.selectOption(this.options()[this.highlightedIndex]);
					event.preventDefault();
					break;
				case " ":
					if (this.highlightedIndex >= 0) {
						this.selectOption(
							this.options()[this.highlightedIndex],
						);
					} else {
						this.dropdownOpen = false;
						this.activeDescendantId = "";
					}
					event.preventDefault();
					break;
				case "Escape":
					this.dropdownOpen = false;
					this.activeDescendantId = "";
					event.preventDefault();
					break;
				case "Tab":
					this.dropdownOpen = false;
					this.activeDescendantId = "";
					break;
			}
		} else {
			if (event.key === "Enter" || event.key === " ") {
				this.toggleDropdown();
				event.preventDefault();
			}
		}
	}
}
