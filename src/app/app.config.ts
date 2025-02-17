import {
	type ApplicationConfig,
	provideZoneChangeDetection,
} from "@angular/core";
import {
	provideRouter,
	TitleStrategy,
	withComponentInputBinding,
	withRouterConfig,
} from "@angular/router";

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
import { ChartTitleStrategy } from "./routes/chart/chart-title.strategy";

export const appConfig: ApplicationConfig = {
	providers: [
		MatIconRegistry, // MatIconRegistry config
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideClientHydration(withEventReplay()),
		provideAnimationsAsync(),
		provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withRouterConfig({
				onSameUrlNavigation: "reload",
			}),
		),
		{ provide: TitleStrategy, useClass: ChartTitleStrategy },
	],
};
