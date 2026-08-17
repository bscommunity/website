import {
	type ApplicationConfig,
	provideZonelessChangeDetection,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import {
	provideRouter,
	TitleStrategy,
	withComponentInputBinding,
	withInMemoryScrolling,
	withRouterConfig,
} from "@angular/router";

import { routes } from "./app.routes";
import {
	provideClientHydration,
	withEventReplay,
} from "@angular/platform-browser";

import {
	provideNgIconsConfig,
	provideNgIconLoader,
	provideNgGlyphs,
	withCaching,
} from "@ng-icons/core";
import { withMaterialSymbolsRounded } from "@ng-icons/material-symbols";

import {
	provideHttpClient,
	withFetch,
	withInterceptors,
} from "@angular/common/http";

import { authInterceptor } from "./routes/auth/auth.interceptor";
import { ChartTitleStrategy } from "./routes/dashboard/chart/chart-title.strategy";

const CUSTOM_SVG_ICONS: Record<string, string> = {
	logo: "assets/logos/logo.svg",
	github: "assets/logos/github.svg",
	discord: "assets/logos/discord.svg",
	google: "assets/logos/google.svg",
	spotify: "assets/logos/spotify.svg",
	deezer: "assets/logos/deezer.svg",
	"yt-music": "assets/logos/yt-music.svg",
	tidal: "assets/logos/tidal.svg",
	"apple-music": "assets/logos/apple-music.svg",
	deluxe: "assets/icons/deluxe.svg",
};

export const appConfig: ApplicationConfig = {
	providers: [
		provideNgIconsConfig({ size: "1.5em" }),
		provideNgGlyphs(withMaterialSymbolsRounded()),
		provideNgIconLoader(
			(name) => {
				const path = CUSTOM_SVG_ICONS[name] ?? `assets/${name}.svg`;
				return fetch(path).then((res) => res.text());
			},
			withCaching(),
		),
		provideZonelessChangeDetection(),
		provideBrowserGlobalErrorListeners(),
		provideClientHydration(withEventReplay()),
		provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withInMemoryScrolling({
				scrollPositionRestoration: "top",
				anchorScrolling: "enabled",
			}),
			withRouterConfig({
				onSameUrlNavigation: "reload",
			}),
		),
		{ provide: TitleStrategy, useClass: ChartTitleStrategy },
	],
};
