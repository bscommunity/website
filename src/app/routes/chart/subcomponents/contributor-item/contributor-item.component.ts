import {
	Component,
	EventEmitter,
	Input,
	Output,
	WritableSignal,
} from "@angular/core";

// Modules
import { MatIconModule } from "@angular/material/icon";

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
		MatIconModule,
		MatButtonModule,
		ContributorTagsComponent,
		AvatarComponent,
	],
	templateUrl: "./contributor-item.component.html",
})
export class ContributorItemComponent {
	@Input() user!: SimplifiedUserModel;
	@Input() roles!: WritableSignal<Map<string, Array<ContributorRole>>>;
	@Input({
		transform: (value: string) => value !== "false",
	})
	canRemove = false;
	@Output() remove = new EventEmitter<string>();
}
