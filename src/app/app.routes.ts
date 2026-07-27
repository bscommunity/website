import type { Routes } from "@angular/router";

// Resolvers
import { ChartResolver } from "./routes/dashboard/chart/chart-resolver.service";
import { TourPassResolver } from "./routes/dashboard/tourpass/tourpass-resolver.service";

// Guards
import {
	isAuthenticatedGuard,
	redirectIfAuthenticatedGuard,
} from "./routes/auth/auth.guard";

export const routes: Routes = [
	{
		path: "", // Public section
		loadComponent: () =>
			import("./layouts/public-layout.component").then(
				(m) => m.PublicLayoutComponent,
			),
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
				path: "workshop",
				loadComponent: () =>
					import("./routes/public/workshop/workshop").then(
						(m) => m.WorkshopComponent,
					),
				title: "Workshop",
			},
			{
				path: "release-notes",
				loadComponent: () =>
					import("./routes/public/release-notes/release-notes").then(
						(m) => m.ReleaseNotes,
					),
				title: "Release Notes",
			},
			{
				path: "privacy",
				loadComponent: () =>
					import("./routes/public/privacy/privacy").then(
						(m) => m.PrivacyPolicy,
					),
				title: "Our Privacy Policy: Transparency for Our Community",
			},
			{
				path: "terms",
				loadComponent: () =>
					import("./routes/public/terms/terms").then(
						(m) => m.TermsOfService,
					),
				title: "Our Terms of Service",
			},
			{
				path: "link/:type/:id",
				loadComponent: () =>
					import("./routes/public/link/link").then((m) => m.Link),
			},
			{
				path: "profile/:username",
				loadComponent: () =>
					import("./routes/public/profile/profile").then(
						(m) => m.Profile,
					),
			},
			// ... other public routes
		],
	},

	{
		path: "dashboard", // Authenticated dashboard section
		loadComponent: () =>
			import("./layouts/dashboard-layout.component").then(
				(m) => m.DashboardLayoutComponent,
			),
		children: [
			{ path: "", redirectTo: "uploads", pathMatch: "full" },
			/* {
				path: "",
				loadComponent: () =>
					import("./routes/dashboard/overview/overview").then(
						(m) => m.OverviewComponent,
					),
				canActivate: [isAuthenticatedGuard],
				title: "Overview",
			}, */
			{
				path: "uploads",
				loadComponent: () =>
					import("./routes/dashboard/uploads/uploads").then(
						(m) => m.Uploads,
					),
				canActivate: [isAuthenticatedGuard],
				title: "Uploads",
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
		{
			path: "tourpass/:id",
			loadComponent: () =>
				import("./routes/dashboard/tourpass/tourpass").then(
					(m) => m.TourPass,
				),
			resolve: { tourpass: TourPassResolver },
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
