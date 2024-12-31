import {
	type ApplicationConfig,
	provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import {
	provideClientHydration,
	withEventReplay,
} from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

import { MatIconRegistry } from "@angular/material/icon";
import { provideHttpClient } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideClientHydration(withEventReplay()),
		provideAnimationsAsync(),
		// MatIconRegistry config
		MatIconRegistry,
		provideHttpClient(),
	],
};
