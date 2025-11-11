import {
	ChangeDetectionStrategy,
	Component,
	input,
	signal,
} from "@angular/core";

// Material
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";

// Models
import { ContributorModel } from "@/models/contributor.model";
import { getContributorRoleLabel } from "@/models/enums/role.enum";

@Component({
	selector: "app-chart-contributors",
	imports: [MatExpansionModule, MatIconModule],
	templateUrl: "./chart-contributors.html",
	styleUrls: ["./chart-contributors.component.css"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartContributorsComponent {
	contributors = input.required<ContributorModel[]>();
	isExpanded = signal(false);

	getRolesString(contributor: ContributorModel): string {
		return contributor.roles
			.map((r) => getContributorRoleLabel(r))
			.join(", ");
	}
}
