import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	Input,
	ViewChild,
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
	@Input() autoComplete: MatAutocomplete = new MatAutocomplete();

	@ViewChild("input") input!: ElementRef<HTMLInputElement>;
	@Input() onSearch: (value: string) => void = () => {};
	@Input() debounceDuration: number = 300;
	@Input() placeholder: string = "Search";
	@Input() disabled: boolean = false;

	private searchSubject = new Subject<string>();
	private searchSubscription: Subscription;

	constructor() {
		this.searchSubscription = this.searchSubject
			.pipe(debounceTime(this.debounceDuration))
			.subscribe((value) => {
				this.onSearch(value);
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
