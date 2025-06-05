import type { Routes } from "@angular/router";



// Routes




// Linking Routes





// Error Routes



// Auth Routes



// Resolvers
import { ChartResolver } from "./routes/chart/chart-resolver.service";
import {
	isAuthenticatedGuard,
	redirectIfAuthenticatedGuard,
} from "./auth/auth.guard";

export const routes: Routes = [
	{
		path: "login",
		loadComponent: () => import('./routes/auth/login/login.component').then(m => m.LoginComponent),
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Login",
	},
	{
		path: "callback",
		loadComponent: () => import('./routes/auth/callback/callback.component').then(m => m.OAuthCallbackComponent),
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Authenticating...",
	},
	{
		path: "overview",
		loadComponent: () => import('./routes/overview/overview.component').then(m => m.OverviewComponent),
		canActivate: [isAuthenticatedGuard],
		title: "Overview",
	},
	{
		path: "published",
		loadComponent: () => import('./routes/published/published.component').then(m => m.PublishedComponent),
		canActivate: [isAuthenticatedGuard],
		title: "Published",
	},
	{
		path: "chart/:id",
		loadComponent: () => import('./routes/chart/chart.component').then(m => m.ChartComponent),
		resolve: { chart: ChartResolver },
		canActivate: [isAuthenticatedGuard],
		runGuardsAndResolvers: "always",
	},
	{
		path: "release-notes",
		loadComponent: () => import('./routes/release-notes/release-notes.component').then(m => m.ReleaseNotesComponent),
		title: "Release Notes",
	},
	{
		path: "privacy-policy",
		loadComponent: () => import('./routes/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
		title: "Our Privacy Policy: Transparency for Our Community",
	},
	{
		path: "terms-of-service",
		loadComponent: () => import('./routes/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent),
		title: "Our Terms of Service",
	},
	{
		path: "link/:type/:id",
		loadComponent: () => import('./routes/link/link.component').then(m => m.LinkComponent),
	},
	{
		path: "error",
		loadComponent: () => import('./routes/error/error.component').then(m => m.PageErrorComponent),
		title: "Error",
	},
	{
		path: "",
		loadComponent: () => import('./routes/landing.component').then(m => m.LandingComponent),
		title: "bscm",
	},
	// { path: "", redirectTo: "/published", pathMatch: "full" }, // Redirect to published
	{ path: "**", title: "Oops. 404", loadComponent: () => import('./routes/not-found/not-found.component').then(m => m.PageNotFoundComponent) }, // Should be the last
];
