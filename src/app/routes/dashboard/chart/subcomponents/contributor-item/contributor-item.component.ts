import {
  Component,
  WritableSignal,
  input,
  output
} from "@angular/core";

// Modules
import { NgGlyph } from "@ng-icons/core";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";
import { ContributorTagsComponent } from "../contributor-tags/contributor-tags.component";

// Models
import { SimplifiedUserModel } from "@/models/user.model";
import { ContributorRole } from "@/models/enums/role.enum";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: "app-contributor-item",
	imports: [
		NgGlyph,
		MatButtonModule,
		ContributorTagsComponent,
		AvatarComponent,
	],
	templateUrl: "./contributor-item.component.html",
})
export class ContributorItemComponent {
	readonly user = input.required<SimplifiedUserModel>();
	readonly roles = input.required<WritableSignal<Map<string, ContributorRole[]>>>();
	readonly canRemove = input(false, { transform: (value: string /*T:VAE*/) => value !== "false" });
	readonly remove = output<string>();
}
