import { Injectable, inject } from "@angular/core";
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

// Services
import { TourPassService } from "@/services/api/tour-pass.service";

// Models
import { TourPassModel } from "@/models/tour-pass.model";

// Zod
import { ZodError } from "zod";

@Injectable({
	providedIn: "root",
})
export class TourPassResolver implements Resolve<TourPassModel | null> {
	private tourPassService = inject(TourPassService);
	private router = inject(Router);

	async resolve(route: ActivatedRouteSnapshot): Promise<TourPassModel | null> {
		const tourPassId = route.paramMap.get("id");

		if (!tourPassId) {
			console.error("Tour pass ID not provided");

			this.router.navigate(["404"], {
				state: { error: "Tour pass ID not provided" },
			});
			return null;
		}

		try {
			const tourPass = await this.tourPassService.getTourPassById(tourPassId);
			return tourPass;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error("Error fetching tour pass", error);

			if (error instanceof ZodError) {
				this.router.navigate(["error"], {
					state: { error: "Invalid tour pass data structure" },
				});
				return null;
			}

			if (error.status === 404 || error.status === 400) {
				console.error("Tour pass not found");
				this.router.navigate(["404"], {
					state: { error: "Tour pass not found" },
				});
				return null;
			}

			this.router.navigate(["error"], {
				state: { error: `${error.statusText}: ${error.error}` },
			});

			return null;
		}
	}
}
