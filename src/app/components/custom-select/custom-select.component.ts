// biome-ignore lint/style/useImportType: ElementRef is used as dependency injection token
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
} from "@angular/core";

import { fromEvent, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { CommonModule, isPlatformBrowser } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatRippleModule } from "@angular/material/core";

export interface Option {
	value: string;
	label: string;
	icon: string;
}

@Component({
	selector: "app-custom-select",
	imports: [CommonModule, MatIconModule, MatRippleModule],
	templateUrl: "./custom-select.component.html",
})
export class CustomSelectComponent implements AfterViewInit {
	@ViewChild("dropdown") dropdown!: ElementRef;

	constructor(
		// biome-ignore lint/complexity/noBannedTypes: Object is used in the constructor
		@Inject(PLATFORM_ID) private platformId: Object,
		private renderer: Renderer2,
		private elementRef: ElementRef,
		private cdr: ChangeDetectorRef,
	) {}

	@Input() options: Option[] = [];
	@Input() selectedOption: Option | null = null;
	dropdownOpen = false;

	@Output() selectionChange = new EventEmitter<Option>();

	/*  */

	adjustDropdownPosition() {
		if (typeof window === "undefined") {
			return;
		}

		const triggerRect = this.elementRef.nativeElement.getBoundingClientRect();
		const dropdownHeight = this.dropdown.nativeElement.offsetHeight;
		const viewportHeight = window.innerHeight;

		const spaceBelow = viewportHeight - triggerRect.bottom;
		const spaceAbove = triggerRect.top;

		if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
			// Position above
			this.renderer.setStyle(
				this.dropdown.nativeElement,
				"bottom",
				`${triggerRect.height + 10}px`,
			);
			this.renderer.setStyle(this.dropdown.nativeElement, "top", "auto");
		} else {
			// Position below
			this.renderer.setStyle(
				this.dropdown.nativeElement,
				"top",
				`${triggerRect.height}px`,
			);
			this.renderer.setStyle(this.dropdown.nativeElement, "bottom", "auto");
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
		/* setTimeout(() => {
			this.dropdownOpen = false;
		}, 0); */

		this.dropdownOpen = false;
		this.cdr.detectChanges(); // Manually trigger change detection
	}

	toggleDropdown() {
		this.dropdownOpen = !this.dropdownOpen;
		this.cdr.detectChanges(); // Trigger change detection

		if (this.dropdownOpen) {
			// console.log("Adjusting");
			this.adjustDropdownPosition();
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
}
