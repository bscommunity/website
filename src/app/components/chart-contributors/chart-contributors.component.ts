import {
	ChangeDetectionStrategy,
	Component,
	input,
	signal,
} from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Models
import { ContributorModel } from "@/models/contributor.model";
import { getContributorRoleLabel } from "@/models/enums/role.enum";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-chart-contributors",
	imports: [MatIconModule, AvatarComponent, RouterLink],
	templateUrl: "./chart-contributors.html",
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

	getChartByString(): string {
		return (
			"Chart by " +
			this.contributors()
				.slice(0, 3)
				.map((c) => "@" + c.user.username)
				.join(", ")
		);
	}
}
