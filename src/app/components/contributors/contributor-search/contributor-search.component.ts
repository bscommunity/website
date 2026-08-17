import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	output,
	signal,
	viewChild,
} from "@angular/core";

import {
	MatAutocompleteModule,
	MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { SearchbarComponent } from "@/components/searchbar/searchbar.component";
import { AvatarComponent } from "@/components/avatar/avatar.component";

import { SimplifiedUserModel } from "@/models/user.model";
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/api/user.service";

@Component({
	selector: "app-contributor-search",
	template: `
		<app-searchbar
			#searchbar
			[debounceDuration]="debounceDuration()"
			[onSearch]="onSearchFn"
			[autoComplete]="auto"
			placeholder="Search for community members"
			class="w-full mb-4"
		>
			<mat-autocomplete
				class="mt-2"
				#auto="matAutocomplete"
				(optionSelected)="onOptionSelected($event)"
			>
				@if (queryResults() === "start") {
					<mat-option class="pointer-events-none select-none w-full">
						<p class="text-center w-full">Start typing to search</p>
					</mat-option>
				} @else if (queryResults() === undefined) {
					<mat-option class="pointer-events-none select-none w-full">
						<span class="flex items-center justify-center w-full">
							<mat-progress-spinner
								mode="indeterminate"
								diameter="24"
							></mat-progress-spinner>
						</span>
					</mat-option>
				} @else if (queryResults() === null) {
					<mat-option class="pointer-events-none select-none w-full">
						<p class="text-center w-full">
							We found an error while fetching the data
						</p>
					</mat-option>
				} @else if (filteredUsers().length === 0) {
					<mat-option
						class="w-full flex items-center justify-center pointer-events-none select-none"
					>
						<p class="text-center w-full">No results found</p>
					</mat-option>
				} @else {
					@for (user of filteredUsers(); track user.id) {
						<mat-option [value]="user.username">
							<span
								class="flex flex-row items-center justify-start gap-4"
							>
								<app-avatar
									class="w-8 h-8"
									[src]="user.avatarUrl"
									[alt]="user.username"
								/>
								&#64;{{ user.username }}
							</span>
						</mat-option>
					}
				}
			</mat-autocomplete>
		</app-searchbar>
	`,
	imports: [
		MatAutocompleteModule,
		MatProgressSpinnerModule,
		SearchbarComponent,
		AvatarComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributorSearchComponent {
	private authService = inject(AuthService);
	private userService = inject(UserService);

	readonly existingUserIds = input<string[]>([]);
	readonly debounceDuration = input<number>(500);

	readonly userAdded = output<SimplifiedUserModel>();

	readonly searchbar = viewChild.required<SearchbarComponent>("searchbar");

	private readonly username: string | null = null;

	readonly queryResults = signal<
		SimplifiedUserModel[] | undefined | null | "start"
	>("start");

	private readonly userLookup = new Map<string, SimplifiedUserModel>();

	readonly filteredUsers = computed(() => {
		const results = this.queryResults();
		if (Array.isArray(results)) return results;
		return [];
	});

	readonly onSearchFn: (value: string) => void;

	constructor() {
		this.username = this.authService.user.username;
		this.onSearchFn = this.onSearch.bind(this);
	}

	private onSearch(value: string): void {
		if (value.length < 2) {
			this.queryResults.set("start");
			return;
		}

		if (!this.username) {
			console.error("User not logged in");
			this.authService.logout();
			return;
		}

		this.queryResults.set(undefined);

		this.userService.searchUsers(value).subscribe({
			next: (response) => {
				const filtered = response.filter(
					(user) =>
						user.username !== this.username &&
						!this.existingUserIds().includes(user.id),
				);

				this.userLookup.clear();
				for (const user of filtered) {
					this.userLookup.set(user.username, user);
				}

				this.queryResults.set(filtered);
			},
			error: (error) => {
				console.error("Error fetching users:", error);
				this.queryResults.set(null);
			},
		});
	}

	onOptionSelected(event: MatAutocompleteSelectedEvent): void {
		const user = this.userLookup.get(event.option.value);

		if (user) {
			this.userAdded.emit(user);
		}

		this.searchbar().clearSearch();
		event.option.deselect();
	}
}
