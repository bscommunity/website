import {
	Component,
	WritableSignal,
	input,
	output,
	booleanAttribute,
} from "@angular/core";

import { NgGlyph } from "@ng-icons/core";
import { MatButtonModule } from "@angular/material/button";

import { AvatarComponent } from "@/components/avatar/avatar.component";
import { ContributorTagsComponent } from "../contributor-tags/contributor-tags.component";

import { SimplifiedUserModel } from "@/models/user.model";
import { ContributorRole } from "@/models/enums/role.enum";

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
	readonly roles =
		input.required<WritableSignal<Map<string, ContributorRole[]>>>();
	readonly availableRoles = input.required<ContributorRole[]>();
	readonly disabled = input(false, { transform: booleanAttribute });
	readonly remove = output<string>();
}
