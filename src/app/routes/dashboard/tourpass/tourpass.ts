import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, TitleStrategy } from "@angular/router";

// Modules
import { FormsModule } from "@angular/forms";
import { NgGlyph } from "@ng-icons/core";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

// Components
import { AsideComponent } from "./subcomponents/aside/aside.component";
import { TracksSectionComponent } from "./sections/tracks/tracks.component";
import { DangerZoneComponent } from "./sections/danger-zone/danger-zone.component";
import { PageError } from "../../error/error";

// Models
import { TourPassModel } from "@/models/tour-pass.model";

// Providers
import { TourpassTitleStrategy } from "./tourpass-title.strategy";

// Services
import { AuthService } from "@/services/auth.service";

@Component({
	selector: "app-tourpass",
	imports: [
		FormsModule,
		MatButtonModule,
		MatTooltipModule,
		AsideComponent,
		TracksSectionComponent,
		DangerZoneComponent,
		PageError,
	],
	providers: [{ provide: TitleStrategy, useClass: TourpassTitleStrategy }],
	templateUrl: "./tourpass.html",
})
export class TourPass implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private authService = inject(AuthService);

	readonly tourpass = signal<TourPassModel | null>(null);

	readonly isOwner = computed(() => {
		const t = this.tourpass();
		if (!t) return false;
		const currentUserId = this.authService.user?.id;
		if (!currentUserId) return false;
		return t.authorId === currentUserId;
	});

	readonly isContributor = computed(() => {
		const t = this.tourpass();
		if (!t) return false;
		const currentUserId = this.authService.user?.id;
		if (!currentUserId) return false;
		if (this.isOwner()) return false;
		return t.contributors.some(
			(contrib) => contrib.user.id === currentUserId,
		);
	});

	ngOnInit(): void {
		this.route.params.subscribe(() => {
			const data = this.route.snapshot.data["tourpass"];
			this.tourpass.set(data);

			console.log("Tourpass data:", data);

			if (!data) {
				this.router.navigate(["error"], {
					state: { error: "Tour pass data is incomplete" },
				});
			}
		});
	}

	onTourPassUpdated(updated: TourPassModel) {
		this.tourpass.set(updated);
	}

	onChartsChanged(charts: import("@/models/chart.model").ChartModel[]) {
		this.tourpass.update((tp) =>
			tp ? { ...tp, charts } : tp,
		);
	}
}
