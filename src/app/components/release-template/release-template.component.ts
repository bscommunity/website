import { Component, OnInit, input } from "@angular/core";

// Components
import { ReleaseTemplateItemComponent } from "./release-item.component";

export interface ReleaseNote {
	version: string;
	date: string;
	extra?: string;
	features?: string[];
	refactors?: string[];
	fixes?: string[];
	style?: string[];
	/* fixes: {
		description: string;
		issue: number;
	}[]; */
}

export interface ReleaseNoteResponse {
	url: string;
	tag_name: string;
	published_at: string;
	body: string;
}

@Component({
	selector: "app-release-template",
	imports: [ReleaseTemplateItemComponent],
	templateUrl: "./release-template.component.html",
})
export class ReleaseTemplateComponent implements OnInit {
	readonly release = input.required<ReleaseNote>();
	readonly isLast = input.required<boolean>();
	readonly icon = input.required<string>();

	releaseDate: string = "";

	ngOnInit(): void {
		// console.log("Release data:", this.release);
		this.releaseDate = new Date(this.release().date).toLocaleDateString(
			"en-US",
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			},
		);
	}
}
