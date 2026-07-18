import { Component, ViewEncapsulation, input } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { NgGlyph } from "@ng-icons/core";

export interface TermsSection {
	title: string;
	id: string;
	content: string;
}

@Component({
	selector: "app-terms-template",
	imports: [RouterLink, NgGlyph],
	templateUrl: "./terms-template.component.html",
	styleUrl: "./terms-template.component.css",
	encapsulation: ViewEncapsulation.None,
})
export class TermsTemplateComponent {
	readonly baseUrl = input.required<string>();
	readonly sections = input.required<TermsSection[]>();
}
