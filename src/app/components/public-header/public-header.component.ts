import {
	Component,
	ViewChild,
	ElementRef,
	HostListener,
	inject,
	ChangeDetectorRef,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";

// Material
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

// RxJS
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

// Services
import { ChartService } from "@/services/api/chart.service";
import { FilterService } from "@/services/filter.service";

// Components
import { MobileMenuComponent } from "./subcomponents/mobile-menu.component";
import { MatRipple } from "@angular/material/core";

@Component({
	selector: "app-public-header",
	imports: [
		MatIconModule,
		MatButtonModule,
		RouterLink,
		RouterLinkActive,
		MatAutocompleteModule,
		MatProgressSpinnerModule,
		MobileMenuComponent,
		MatRipple,
	],
	templateUrl: "./public-header.component.html",
})
export class PublicHeaderComponent {
	private chartService = inject(ChartService);
	private router = inject(Router);
	private workshopFilterService = inject(FilterService);
	private cdr = inject(ChangeDetectorRef);

	private document = inject(DOCUMENT);

	@ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;
	@ViewChild(MatAutocompleteTrigger) autoTrigger!: MatAutocompleteTrigger;

	queryCharts: string[] | undefined | null | "start" = "start";
	isMobileMenuOpen = false;

	private searchSubject = new Subject<string>();

	constructor() {
		this.searchSubject.pipe(debounceTime(300)).subscribe((value) => {
			this.onSearch(value);
		});
	}

	toggleMobileMenu() {
		this.document.defaultView?.scrollTo({ behavior: "instant", top: 0 });
		this.isMobileMenuOpen = !this.isMobileMenuOpen;
		this.document.body.style.overflow = this.isMobileMenuOpen
			? "hidden"
			: "";
	}

	closeMobileMenu() {
		this.isMobileMenuOpen = false;
	}

	onNavigateToSearch() {
		const value = this.searchInput.nativeElement.value.trim();
		if (value) {
			// Set query in global workshop state and navigate without params
			this.workshopFilterService.setQuery(value);
			this.router.navigate(["/workshop"]);

			// Reset the input and close suggestions
			this.searchInput.nativeElement.value = "";
			this.autoTrigger.closePanel();
			this.queryCharts = "start";
		}
	}

	@HostListener("document:keydown", ["$event"])
	onKeyDown(event: KeyboardEvent) {
		if (event.key === "f" || event.key === "F") {
			if (!this.searchInput.nativeElement.value) {
				event.preventDefault();
				this.searchInput.nativeElement.focus();
			}
		}

		if (event.key === "Escape") {
			event.preventDefault();
			this.searchInput.nativeElement.value = "";
			this.searchInput.nativeElement.blur();
		}

		if (event.key === "Enter") {
			event.preventDefault();
			this.onNavigateToSearch();
		}
	}

	onInput(event: Event) {
		this.searchSubject.next((event.target as HTMLInputElement).value);
	}

	onSearch(value: string): void {
		if (value.length < 2) {
			this.queryCharts = "start";
			this.cdr.detectChanges();
			return;
		}

		this.queryCharts = undefined;
		this.cdr.detectChanges();

		this.chartService.getSuggestions(value).subscribe({
			next: (charts) => {
				this.queryCharts = charts;
				this.cdr.detectChanges();
			},
			error: (error) => {
				console.error("Error fetching charts:", error);
				this.queryCharts = null;
				this.cdr.detectChanges();
			},
		});
	}

	onOptionSelected() {
		this.onNavigateToSearch();
	}
}
