import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	signal,
} from "@angular/core";

// Icons
import { NgGlyph } from "@ng-icons/core";

// Components
import { AvatarComponent } from "@/components/avatar/avatar.component";

// Models
import { ContributorModel } from "@/models/contributor.model";
import { ContributorRole, getContributorRoleLabel } from "@/models/enums/role.enum";
import { SimplifiedUserModel } from "@/models/user.model";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter, take } from "rxjs";

interface GroupedContributor {
	user: SimplifiedUserModel;
	roles: ContributorRole[];
}

@Component({
	selector: "app-chart-contributors",
	imports: [NgGlyph, AvatarComponent, RouterLink],
	templateUrl: "./chart-contributors.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartContributorsComponent {
	private readonly router = inject(Router);

	contributors = input.required<ContributorModel[]>();
	onClose = input.required<() => void>();
	isExpanded = signal(false);

	readonly groupedContributors = computed(() => {
		const map = new Map<string, GroupedContributor>();
		for (const c of this.contributors()) {
			const existing = map.get(c.user.id);
			if (existing) {
				existing.roles.push(c.role);
			} else {
				map.set(c.user.id, { user: c.user, roles: [c.role] });
			}
		}
		return Array.from(map.values());
	});

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

	getRolesString(roles: ContributorRole[]): string {
		return roles.map(getContributorRoleLabel).join(", ");
	}

	getChartByString(): string {
		const unique = this.groupedContributors().slice(0, 3);
		return (
			"Chart by " +
			unique.map((c) => "@" + c.user.username).join(", ")
		);
	}
}
