import {
	ChangeDetectionStrategy,
	Component,
	inject,
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
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter, take } from "rxjs";

@Component({
	selector: "app-chart-contributors",
	imports: [MatIconModule, AvatarComponent, RouterLink],
	templateUrl: "./chart-contributors.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartContributorsComponent {
	private readonly router = inject(Router);

	contributors = input.required<ContributorModel[]>();
	onClose = input.required<() => void>();
	isExpanded = signal(false);

	onContributorNavigate(): void {
		this.router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				take(1),
			)
			.subscribe(() => {
				this.onClose()();
			});
	}

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
