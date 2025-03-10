import { Component } from "@angular/core";

// Components
import {
	type ReleaseNote,
	ReleaseTemplateComponent,
} from "@/components/release-template/release-template.component";
import { PublicHeaderComponent } from "@/components/public-header/public-header.component";

// Data
import stable from "@/assets/release-notes/stable.json";

@Component({
	selector: "app-release-notes",
	imports: [ReleaseTemplateComponent, PublicHeaderComponent],
	templateUrl: "./release-notes.component.html",
})
export class ReleaseNotesComponent {
	releaseNotes: ReleaseNote[] = stable;
}
