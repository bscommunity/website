import {
	AfterViewInit,
	Directive,
	ElementRef,
	NgZone,
	OnDestroy,
	inject,
} from "@angular/core";

const TRANSITION_DURATION_MS = 250;
const TRANSITION_TIMING = "cubic-bezier(0.4, 0, 0.2, 1)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

@Directive({
	selector: "mat-tab-nav-panel[appTabPanelHeight]",
	standalone: true,
})
export class TabPanelHeightDirective implements AfterViewInit, OnDestroy {
	private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly ngZone = inject(NgZone);

	private resizeObserver?: ResizeObserver;
	private previousHeight = 0;
	private isAnimating = false;
	private prefersReducedMotion = false;
	private addedRelativePosition = false;
	private cleanupTransition?: () => void;

	ngAfterViewInit(): void {
		if (typeof window === "undefined") {
			return;
		}

		const element = this.elementRef.nativeElement;
		this.prefersReducedMotion =
			window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
		this.previousHeight =
			element.getBoundingClientRect().height || element.scrollHeight || 0;

		this.ensureRelativePosition(element);

		if (typeof ResizeObserver === "undefined") {
			return;
		}

		this.ngZone.runOutsideAngular(() => {
			this.resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					if (entry.target === element) {
						this.handleResize(entry);
					}
				}
			});
			this.resizeObserver.observe(element);
		});
	}

	ngOnDestroy(): void {
		this.resizeObserver?.disconnect();
		this.cleanupTransition?.();
		if (this.addedRelativePosition) {
			this.elementRef.nativeElement.style.position = "";
		}
	}

	private ensureRelativePosition(element: HTMLElement) {
		const computedPosition = window.getComputedStyle(element).position;
		if (computedPosition === "static") {
			element.style.position = "relative";
			this.addedRelativePosition = true;
		}
	}

	private handleResize(entry: ResizeObserverEntry) {
		const newHeight = entry.contentRect.height;
		if (!isFinite(newHeight)) {
			return;
		}

		if (this.prefersReducedMotion) {
			this.previousHeight = newHeight;
			return;
		}

		if (
			this.isAnimating ||
			Math.abs(newHeight - this.previousHeight) < 0.5
		) {
			this.previousHeight = newHeight;
			return;
		}

		this.animateHeightChange(newHeight);
	}

	private animateHeightChange(targetHeight: number) {
		const element = this.elementRef.nativeElement;
		const startHeight = this.previousHeight;

		if (Math.abs(targetHeight - startHeight) < 0.5) {
			return;
		}

		this.cleanupTransition?.();
		this.isAnimating = true;

		const hadInlineOverflow = element.style.overflow.length > 0;
		if (!hadInlineOverflow) {
			element.style.overflow = "hidden";
		}

		element.style.height = `${startHeight}px`;
		element.style.transitionProperty = "height";
		element.style.transitionDuration = `${TRANSITION_DURATION_MS}ms`;
		element.style.transitionTimingFunction = TRANSITION_TIMING;
		element.style.willChange = "height";

		// Force reflow so the browser picks up the starting height.
		element.getBoundingClientRect();

		this.ngZone.runOutsideAngular(() => {
			requestAnimationFrame(() => {
				element.style.height = `${targetHeight}px`;
			});
		});

		const finalize = () => {
			element.style.transitionProperty = "";
			element.style.transitionDuration = "";
			element.style.transitionTimingFunction = "";
			element.style.willChange = "";
			element.style.height = "";
			if (!hadInlineOverflow) {
				element.style.overflow = "";
			}
			this.isAnimating = false;
			this.cleanupTransition = undefined;
			this.previousHeight = targetHeight;
		};

		const handleTransitionEnd = (event: TransitionEvent) => {
			if (event.target !== element || event.propertyName !== "height") {
				return;
			}

			element.removeEventListener("transitionend", handleTransitionEnd);
			finalize();
		};

		element.addEventListener("transitionend", handleTransitionEnd);
		this.cleanupTransition = () => {
			element.removeEventListener("transitionend", handleTransitionEnd);
			finalize();
		};
	}
}
