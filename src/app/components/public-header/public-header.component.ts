import {
	Component,
	ViewChild,
	ElementRef,
	HostListener,
	inject,
} from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import {
	MatAutocompleteModule,
	MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterLink, RouterLinkActive } from "@angular/router";

// RxJS
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

// Services
import { ChartService } from "@/services/api/chart.service";
import { FilterService } from "@/services/filter.service";
import { Router } from "@angular/router";

// Models
import { ChartModel } from "@/models/chart.model";

@Component({
	selector: "app-public-header",
	imports: [
		MatIconModule,
		MatButtonModule,
		RouterLink,
		RouterLinkActive,
		MatAutocompleteModule,
		MatProgressSpinnerModule,
	],
	templateUrl: "./public-header.component.html",
})
export class PublicHeaderComponent {
	private chartService = inject(ChartService);
	private router = inject(Router);
	private workshopFilterService = inject(FilterService);

	@ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

	queryCharts: string[] | undefined | null | "start" = "start";

	private searchSubject = new Subject<string>();
	private searchSubscription: Subscription;

	constructor() {
		this.searchSubscription = this.searchSubject
			.pipe(debounceTime(300))
			.subscribe((value) => {
				this.onSearch(value);
			});
	}

	onNavigateToSearch() {
		const value = this.searchInput.nativeElement.value.trim();
		if (value) {
			// Set query in global workshop state and navigate without params
			this.workshopFilterService.setQuery(value);
			this.router.navigate(["/workshop"]);
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
			return;
		}

		this.queryCharts = undefined;

		this.chartService.getSuggestions(value).subscribe({
			next: (charts) => {
				this.queryCharts = charts;
			},
			error: (error) => {
				console.error("Error fetching charts:", error);
				this.queryCharts = null;
			},
		});
	}

	onOptionSelected(event: MatAutocompleteSelectedEvent) {
		this.onNavigateToSearch();
	}
}
