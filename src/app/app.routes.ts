import type { Routes } from "@angular/router";

// Resolvers
import { ChartResolver } from "./routes/chart/chart-resolver.service";

// Guards
import {
	isAuthenticatedGuard,
	redirectIfAuthenticatedGuard,
} from "./auth/auth.guard";

export const routes: Routes = [
	{
		path: "login",
		loadComponent: () =>
			import("./routes/auth/login/login").then((m) => m.Login),
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Login",
	},
	{
		path: "callback",
		loadComponent: () =>
			import("./routes/auth/callback/callback.component").then(
				(m) => m.OAuthCallback,
			),
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Authenticating...",
	},
	{
		path: "overview",
		loadComponent: () =>
			import("./routes/overview/overview").then(
				(m) => m.OverviewComponent,
			),
		canActivate: [isAuthenticatedGuard],
		title: "Overview",
	},
	{
		path: "published",
		loadComponent: () =>
			import("./routes/published/published").then((m) => m.Published),
		canActivate: [isAuthenticatedGuard],
		title: "Published",
	},
	{
		path: "settings",
		loadComponent: () =>
			import("./routes/settings/settings").then((m) => m.Settings),
		canActivate: [isAuthenticatedGuard],
		title: "Settings",
	},
	{
		path: "chart/:id",
		loadComponent: () =>
			import("./routes/chart/chart").then((m) => m.Chart),
		resolve: { chart: ChartResolver },
		canActivate: [isAuthenticatedGuard],
		runGuardsAndResolvers: "always",
	},
	{
		path: "release-notes",
		loadComponent: () =>
			import("./routes/release-notes/release-notes.component").then(
				(m) => m.ReleaseNotes,
			),
		title: "Release Notes",
	},
	{
		path: "privacy-policy",
		loadComponent: () =>
			import("./routes/privacy-policy/privacy-policy").then(
				(m) => m.PrivacyPolicy,
			),
		title: "Our Privacy Policy: Transparency for Our Community",
	},
	{
		path: "terms-of-service",
		loadComponent: () =>
			import("./routes/terms-of-service/terms-of-service").then(
				(m) => m.TermsOfServiceComponent,
			),
		title: "Our Terms of Service",
	},
	{
		path: "link/:type/:id",
		loadComponent: () => import("./routes/link/link").then((m) => m.Link),
	},
	{
		path: "error",
		loadComponent: () =>
			import("./routes/error/error").then((m) => m.PageError),
		title: "Error",
	},
	{
		path: "",
		loadComponent: () =>
			import("./routes/landing").then((m) => m.LandingComponent),
		title: "bscm",
	},
	// { path: "", redirectTo: "/published", pathMatch: "full" }, // Redirect to published
	{
		path: "**",
		title: "Oops. 404",
		loadComponent: () =>
			import("./routes/not-found/not-found").then(
				(m) => m.PageNotFoundComponent,
			),
	}, // Should be the last
];
