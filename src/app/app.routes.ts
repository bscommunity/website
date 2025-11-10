import type { Routes } from "@angular/router";

// Resolvers
import { ChartResolver } from "./routes/dashboard/chart/chart-resolver.service";

// Guards
import {
	isAuthenticatedGuard,
	redirectIfAuthenticatedGuard,
} from "./routes/auth/auth.guard";
import { PublicLayoutComponent } from "./layouts/public-layout.component";
import { DashboardLayoutComponent } from "./layouts/dashboard-layout.component";

export const routes: Routes = [
	{
		path: "", // Public section
		component: PublicLayoutComponent,
		children: [
			// { path: '', redirectTo: 'home', pathMatch: 'full' },
			{
				path: "",
				loadComponent: () =>
					import("./routes/public/landing/landing").then(
						(m) => m.LandingComponent,
					),
				title: "bscm",
			},
			{
				path: "release-notes",
				loadComponent: () =>
					import(
						"./routes/public/release-notes/release-notes.component"
					).then((m) => m.ReleaseNotes),
				title: "Release Notes",
			},
			{
				path: "privacy-policy",
				loadComponent: () =>
					import(
						"./routes/public/privacy-policy/privacy-policy"
					).then((m) => m.PrivacyPolicy),
				title: "Our Privacy Policy: Transparency for Our Community",
			},
			{
				path: "terms-of-service",
				loadComponent: () =>
					import(
						"./routes/public/terms-of-service/terms-of-service"
					).then((m) => m.TermsOfServiceComponent),
				title: "Our Terms of Service",
			},
			{
				path: "link/:type/:id",
				loadComponent: () =>
					import("./routes/public/link/link").then((m) => m.Link),
			},
			// ... other public routes
		],
	},

	{
		path: "dashboard", // Authenticated dashboard section
		component: DashboardLayoutComponent,
		children: [
			// { path: "", redirectTo: "overview", pathMatch: "full" },
			{
				path: "",
				loadComponent: () =>
					import("./routes/dashboard/overview/overview").then(
						(m) => m.OverviewComponent,
					),
				canActivate: [isAuthenticatedGuard],
				title: "Overview",
			},
			{
				path: "published",
				loadComponent: () =>
					import("./routes/dashboard/published/published").then(
						(m) => m.Published,
					),
				canActivate: [isAuthenticatedGuard],
				title: "Published",
			},
			{
				path: "settings",
				loadComponent: () =>
					import("./routes/dashboard/settings/settings").then(
						(m) => m.Settings,
					),
				canActivate: [isAuthenticatedGuard],
				title: "Settings",
			},
			{
				path: "chart/:id",
				loadComponent: () =>
					import("./routes/dashboard/chart/chart").then(
						(m) => m.Chart,
					),
				resolve: { chart: ChartResolver },
				runGuardsAndResolvers: "always",
			},
			// ... other dashboard routes
		],
	},

	{
		path: "login",
		loadComponent: () =>
			import("./routes/auth/login/login").then((m) => m.Login),
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Login",
	},
	{
		path: "callback/google",
		loadComponent: () =>
			import("./routes/auth/callback/google").then(
				(m) => m.GoogleOAuthCallback,
			),
		title: "Linking...",
	},
	{
		path: "callback",
		loadComponent: () =>
			import("./routes/auth/callback/callback").then(
				(m) => m.OAuthCallback,
			),
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Authenticating...",
	},
	{
		path: "error",
		loadComponent: () =>
			import("./routes/error/error").then((m) => m.PageError),
		title: "Error",
	},
	{
		path: "**",
		title: "Oops. 404",
		loadComponent: () =>
			import("./routes/not-found/not-found").then(
				(m) => m.PageNotFoundComponent,
			),
	}, // Not-found should be the last
];
