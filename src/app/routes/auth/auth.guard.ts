import { inject } from "@angular/core";
import {
	CanActivateFn,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from "@angular/router";
import { from } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "@/services/auth.service";

export const isAuthenticatedGuard: CanActivateFn = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return from(authService.checkAuthStatus()).pipe(
		map((isLoggedIn) => {
			if (!isLoggedIn) {
				console.log("User is not authenticated");
				// Redirect unauthenticated users back to auth
				return router.createUrlTree(["/login"], {
					queryParams: { returnUrl: state.url },
				});
			}
			return true;
		}),
	);
};

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.isLoggedIn$.pipe(
		map((isLoggedIn) => {
			if (isLoggedIn) {
				// Redirect authenticated users to dashboard
				return router.createUrlTree(["/dashboard"]);
			}
			return true;
		}),
	);
};
