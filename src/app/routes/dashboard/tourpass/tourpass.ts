import { Component, OnInit, inject } from "@angular/core";
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

	set tourpass(value: TourPassModel) {
		this._tourpass = value;
	}

	get tourpass(): TourPassModel {
		return this._tourpass;
	}

	private _tourpass!: TourPassModel;

	ngOnInit(): void {
		this.route.params.subscribe(() => {
			this.tourpass = this.route.snapshot.data["tourpass"];

			console.log("Tourpass data:", this.tourpass);

			if (!this.tourpass) {
				this.router.navigate(["error"], {
					state: { error: "Tour pass data is incomplete" },
				});
			}
		});
	}

	onTourPassUpdated(updated: TourPassModel) {
		this.tourpass = updated;
	}
}
