import { Component } from "@angular/core";

import { LargePanelComponent } from "@/components/panel/large-panel.component";
import {
	type TermsSection,
	TermsTemplateComponent,
} from "@/components/terms-template/terms-template.component";

@Component({
	selector: "app-terms-of-service",
	imports: [LargePanelComponent, TermsTemplateComponent],
	templateUrl: "./terms-of-service.component.html",
})
export class TermsOfServiceComponent {
	sections: TermsSection[] = [
		{
			title: "Acceptance of Terms",
			id: "acceptance-of-terms",
			content: `
				<p>By using our app, you confirm that you have read and agree to these terms, which have been created 	to protect the community and ensure a secure, enjoyable experience for all.</p>
			`,
		},
		{
			title: "What Is Our Service?",
			id: "what-is-our-service",
			content: `
				<p>Our service includes a server for processing links, a web application for content publication and organization, and a mobile application for Android, where you download shared content.</p>
				<p>Remember: We are a community built on sharing links – we don’t store files; we simply help you access the content you share.</p>
			`,
		},
		{
			title: "Types of Content",
			id: "types-of-content",
			content: `
				<li><strong>Chart:</strong> Combines the game’s music and level.</li>
				<li><strong>Tour Pass:</strong> A collection of Charts.</li>
				<li><strong>Theme:</strong> A skin or theme for the game.</li>
				<p>All of these contents are submitted by you and are entirely your responsibility.</p>
			`,
		},
		{
			title: "User Responsibility",
			id: "user-responsibility",
			content: `
				<p>You are solely responsible for the content you share. This means you must ensure you have all the necessary rights to share it, relieving the app of any liability related to copyright or intellectual property issues.</p>
			`,
		},
		{
			title: "Moderation and Community Respect",
			id: "moderation-community-respect",
			content: `
				<p>While we do not pre-moderate content, we reserve the right to remove or edit any content that violates these terms or might harm the community’s experience.</p>
				<p>Our goal is to maintain a friendly environment where everyone can contribute with respect and responsibility.</p>
			`,
		},
		{
			title: "Changes to the Terms",
			id: "changes-to-the-terms",
			content: `
				<p>We may update these terms from time to time to better serve our community. <br />
				Please stay tuned for notifications, and by continuing to use the app, you agree to any changes.</p>
			`,
		},
		{
			title: "Contact Us",
			id: "contact-us",
			content: `
				<p>If you have any questions, suggestions, or need help, please contact us through our official channels. <br />
				We’re here to listen and help!</p>
			`,
		},
	];
}
