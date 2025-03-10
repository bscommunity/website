import { Component } from "@angular/core";

// Components
import { LargePanelComponent } from "@/components/panel/large-panel.component";
import {
	type TermsSection,
	TermsTemplateComponent,
} from "@/components/terms-template/terms-template.component";
import { PublicHeaderComponent } from "@/components/public-header/public-header.component";

@Component({
	selector: "app-privacy-policy",
	imports: [
		LargePanelComponent,
		TermsTemplateComponent,
		TermsTemplateComponent,
		PublicHeaderComponent,
	],
	templateUrl: "./privacy-policy.component.html",
})
export class PrivacyPolicyComponent {
	sections: TermsSection[] = [
		{
			title: "What Do We Collect?",
			id: "what-do-we-collect",
			content: `
				<li><strong>Technical Data:</strong> We automatically collect technical information (such as access logs and usage statistics) solely to maintain and improve our service.</li>
				<li><strong>Content Links:</strong> You provide us with links for content like Charts, Tour Passes, and Themes – and we do not store any files on our servers.</li>
			`,
		},
		{
			title: "How Do We Use This Data?",
			id: "how-do-we-use-this-data",
			content: `
				<li>The technical data is used solely to enhance your experience, security, and app performance.</li>
				<li>Your links are used only to direct fellow community members to the content you shared.</li>
			`,
		},
		{
			title: "Security and Privacy",
			id: "security-and-privacy",
			content: `
				<p>We make every effort to protect your information and ensure that no personal data is shared with third parties, except when required by law.</p>
				<p>Our commitment is to transparency and prioritizing your privacy.</p>
			`,
		},
		{
			title: "Content Responsibility",
			id: "content-responsibility",
			content: `
				<p>All content submitted – whether it’s a Chart (music/level), a Tour Pass (collection of charts), or a Theme (skin) – is entirely your responsibility.</p>
				<p>You confirm that you hold the necessary rights to share the content, thereby relieving the app of any liability regarding copyright or intellectual property issues.</p>
			`,
		},
		{
			title: "Updates and Contact",
			id: "updates-and-contact",
			content: `
				<p>We may update our policy from time to time, and when we do, we’ll let our community know.</p>
				<p>If you have any questions or suggestions, please reach out through our official channels.</p>
			`,
		},
	];
}
