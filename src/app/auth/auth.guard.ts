import { inject } from "@angular/core";
import {
	CanActivateFn,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from "@angular/router";
import { AuthService } from "./auth.service";
import { map } from "rxjs/operators";

export const isAuthenticatedGuard: CanActivateFn = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.isLoggedIn$.pipe(
		map((isLoggedIn) => {
			if (!isLoggedIn) {
				// Redirect unauthenticated users back to auth
				return router.createUrlTree(["/login"], {
					queryParams: { returnUrl: state.url },
				});
			}
			return true;
		}),
	);
};

export const redirectIfAuthenticatedGuard: CanActivateFn = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.isLoggedIn$.pipe(
		map((isLoggedIn) => {
			if (isLoggedIn) {
				// Redirect authenticated users to dashboard
				return router.createUrlTree(["/published"]);
			}
			return true;
		}),
	);
};
