import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	input,
	viewChild,
	OnInit,
	OnDestroy,
	inject,
	signal,
} from "@angular/core";

import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

// Material
import { MatButtonModule } from "@angular/material/button";
import {
	MatAutocomplete,
	MatAutocompleteModule,
	MatAutocompleteSelectedEvent,
	MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// Icons
import { NgGlyph } from "@ng-icons/core";

// Services
import { ChartService } from "@/services/api/chart.service";

@Component({
	selector: "app-searchbar",
	templateUrl: "./searchbar.component.html",
	imports: [
		NgGlyph,
		MatButtonModule,
		MatAutocompleteModule,
		MatProgressSpinnerModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchbarComponent implements OnInit, OnDestroy {
	readonly autoComplete = input<MatAutocomplete | null>(null);

	readonly input = viewChild.required<ElementRef<HTMLInputElement>>("input");
	readonly auto = viewChild<MatAutocomplete>("auto");
	readonly trigger = viewChild(MatAutocompleteTrigger);
	readonly onSearch = input.required<(value: string) => void>();
	readonly debounceDuration = input<number>(300);
	readonly placeholder = input<string>("Search");
	readonly disabled = input<boolean>(false);
	readonly isLoading = input<boolean>(false);
	readonly enableSuggestions = input<boolean>(false);

	private chartService = inject(ChartService);
	querySuggestions = signal<string[] | "start" | "loading" | "error">(
		"start",
	);

	private searchSubject = new Subject<string>();
	private searchSubscription!: Subscription;

	ngOnInit() {
		this.searchSubscription = this.searchSubject
			.pipe(debounceTime(this.debounceDuration()))
			.subscribe((value) => {
				this.onSearch()(value);

				if (this.enableSuggestions()) {
					this.querySuggestions.set("loading");
					this.chartService.getSuggestions(value).subscribe({
						next: (suggestions) =>
							this.querySuggestions.set(suggestions),
						error: () => this.querySuggestions.set("error"),
					});
				}
			});
	}

	onInput(event: Event) {
		this.searchSubject.next((event.target as HTMLInputElement).value);
	}

	onKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter") {
			const value = this.input().nativeElement.value;
			this.onSearch()(value);
			this.trigger()?.closePanel();
			event.preventDefault();
		}
	}

	onOptionSelected(event: MatAutocompleteSelectedEvent) {
		const value = event.option.value;
		this.input().nativeElement.value = value;
		this.onSearch()(value);
	}

	clearSearch() {
		this.input().nativeElement.value = "";
		this.onSearch()("");
		this.searchSubject.next("");
		this.trigger()?.closePanel();
	}

	setValue(value: string) {
		this.input().nativeElement.value = value;
	}

	ngOnDestroy() {
		this.searchSubscription.unsubscribe();
	}
}
