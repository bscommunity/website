import {
	type ApplicationConfig,
	provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";

import { routes } from "./app.routes";
import {
	provideClientHydration,
	withEventReplay,
} from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

import { MatIconRegistry } from "@angular/material/icon";
import {
	provideHttpClient,
	withFetch,
	withInterceptors,
} from "@angular/common/http";

import { authInterceptor } from "./auth/auth.interceptor";

export const appConfig: ApplicationConfig = {
	providers: [
		MatIconRegistry, // MatIconRegistry config
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes, withComponentInputBinding()),
		provideClientHydration(withEventReplay()),
		provideAnimationsAsync(),
		provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
	],
};
