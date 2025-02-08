import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";

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

		return next(clonedRequest);
	} catch {
		return next(request);
	}
};
