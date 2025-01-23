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
				// Redirect authenticated users accessing /login to /
				return router.createUrlTree(["/"]);
			}
			return true;
		}),
	);
};
