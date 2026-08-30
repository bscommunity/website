import { Injectable, inject } from "@angular/core";
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

// Services
import { ThemeService } from "@/services/api/theme.service";

// Models
import { ThemeModel } from "@/models/theme.model";

// Zod
import { ZodError } from "zod";

@Injectable({
	providedIn: "root",
})
export class ThemeResolver implements Resolve<ThemeModel | null> {
	private themeService = inject(ThemeService);
	private router = inject(Router);

	async resolve(route: ActivatedRouteSnapshot): Promise<ThemeModel | null> {
		const themeId = route.paramMap.get("id");

		if (!themeId) {
			console.error("Theme ID not provided");

			this.router.navigate(["404"], {
				state: { error: "Theme ID not provided" },
			});
			return null;
		}

		try {
			const theme = await this.themeService.getThemeById(themeId);
			return theme;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error("Error fetching theme", error);

			if (error instanceof ZodError) {
				this.router.navigate(["error"], {
					state: { error: "Invalid theme data structure" },
				});
				return null;
			}

			if (error.status === 404 || error.status === 400) {
				console.error("Theme not found");
				this.router.navigate(["404"], {
					state: { error: "Theme not found" },
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
