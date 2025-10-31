import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError, from, switchMap } from "rxjs";

import { AuthService } from "@/services/auth.service";
import { apiUrl } from "@/lib/api";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
	const authService = inject(AuthService);

	if (!request.url.startsWith(apiUrl)) {
		return next(request);
	}

	// Skip token injection for auth endpoints to avoid infinite loops
	if (request.url.includes('/auth/')) {
		return next(request);
	}

	try {
		// Use getValidToken() which handles automatic refresh
		return from(authService.getValidToken()).pipe(
			switchMap((token) => {
				// console.log(`AuthInterceptor: ${request.method} ${request.url} - using token`);

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
							// If we still get 401 after token refresh, logout
							console.error(
								"AuthInterceptor: Unauthorized request after token refresh, logging out.",
							);
							authService.logout();
						}
						return throwError(() => error);
					}),
				);
			}),
			catchError((error) => {
				// If getValidToken fails (e.g., refresh failed), proceed without token
				console.error("AuthInterceptor: Failed to get valid token:", error);
				return next(request);
			})
		);
	} catch {
		return next(request);
	}
};
