import { Component } from "@angular/core";

// Components
import {
	type ReleaseNote,
	ReleaseTemplateComponent,
} from "@/components/release-template/release-template.component";

// Data
import stable from "@/assets/release-notes/stable.json";

@Component({
	selector: "app-release-notes",
	imports: [ReleaseTemplateComponent],
	templateUrl: "./release-notes.component.html",
})
export class ReleaseNotesComponent {
	releaseNotes: ReleaseNote[] = stable;
}
