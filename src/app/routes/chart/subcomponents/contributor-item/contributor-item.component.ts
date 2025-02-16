import { Component, Input, WritableSignal } from "@angular/core";

// Modules
import { MatIconModule } from "@angular/material/icon";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";
import { ContributorTagsComponent } from "../contributor-tags/contributor-tags.component";

// Models
import { SimplifiedUserModel } from "@/models/user.model";
import { ContributorRole } from "@/models/enums/role.enum";

@Component({
	selector: "app-contributor-item",
	imports: [MatIconModule, ContributorTagsComponent, AvatarComponent],
	templateUrl: "./contributor-item.component.html",
})
export class ContributorItemComponent {
	@Input() user!: SimplifiedUserModel;
	@Input() roles!: WritableSignal<Array<ContributorRole>>;
	@Input() onRemove: undefined | ((id: string) => void) = undefined;
}
