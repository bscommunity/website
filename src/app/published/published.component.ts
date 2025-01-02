import { Component } from "@angular/core";
import {
	CustomSelectComponent,
	type Option,
} from "../components/custom-select/custom-select.component";
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: "app-published",
	imports: [MatIconModule, CustomSelectComponent],
	templateUrl: "./published.component.html",
})
export class PublishedComponent {
	sortOptions: Option[] = [
		{
			label: "Newest",
			value: "newest",
		},
		{
			label: "Oldest",
			value: "oldest",
		},
		{
			label: "Most Popular",
			value: "most-popular",
		},
		{
			label: "Least Popular",
			value: "least-popular",
		},
	];

	sortBy: Option = this.sortOptions[0];
}
