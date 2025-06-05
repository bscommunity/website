import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	ViewChild,
	input,
} from "@angular/core";

import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import {
	MatAutocomplete,
	MatAutocompleteModule,
} from "@angular/material/autocomplete";

interface AutoCompleteExceptions {
	[key: string]: any;
}

@Component({
	selector: "app-searchbar",
	templateUrl: "./searchbar.component.html",
	imports: [MatIconModule, MatButtonModule, MatAutocompleteModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchbarComponent {
	readonly autoComplete = input<MatAutocomplete | null>(null);

	@ViewChild("input") input!: ElementRef<HTMLInputElement>;
	readonly onSearch = input<(value: string) => void>(() => {});
	readonly debounceDuration = input<number>(300);
	readonly placeholder = input<string>("Search");
	readonly disabled = input<boolean>(false);

	private searchSubject = new Subject<string>();
	private searchSubscription: Subscription;

	constructor() {
		this.searchSubscription = this.searchSubject
			.pipe(debounceTime(this.debounceDuration()))
			.subscribe((value) => {
				this.onSearch()(value);
			});
	}

	onInput(event: Event) {
		this.searchSubject.next((event.target as HTMLInputElement).value);
	}

	clearSearch() {
		this.input.nativeElement.value = "";
	}

	ngOnDestroy() {
		this.searchSubscription.unsubscribe();
	}
}
