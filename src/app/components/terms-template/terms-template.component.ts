import { Component, Input, ViewEncapsulation } from "@angular/core";
import { RouterLink } from "@angular/router";

// Material
import { MatIcon } from "@angular/material/icon";

export interface TermsSection {
	title: string;
	id: string;
	content: string;
}

@Component({
	selector: "app-terms-template",
	imports: [RouterLink, MatIcon],
	templateUrl: "./terms-template.component.html",
	styleUrl: "./terms-template.component.css",
	encapsulation: ViewEncapsulation.None,
})
export class TermsTemplateComponent {
	@Input() baseUrl!: string;
	@Input() sections!: TermsSection[];
}
