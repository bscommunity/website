import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
	const authService = inject(AuthService);

	try {
		const token = authService.token;

		const clonedRequest = request.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
			withCredentials: true,
		});

		// console.log(`AuthInterceptor: Injected token`);

		return next(clonedRequest).pipe(
			catchError((error) => {
				if (error.status === 401) {
					// Log out the user and redirect to the login page
					authService.logout();
				}
				return throwError(() => error);
			}),
		);
	} catch {
		return next(request);
	}
};
