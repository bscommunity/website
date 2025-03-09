import type { Routes } from "@angular/router";

// Routes
import { PageNotFoundComponent } from "./routes/not-found/not-found.component";
import { PublishedComponent } from "./routes/published/published.component";
import { OverviewComponent } from "./routes/overview/overview.component";
import { ChartComponent } from "./routes/chart/chart.component";

// Auth Routes
import { LoginComponent } from "./routes/auth/login/login.component";
import { OAuthCallbackComponent } from "./routes/auth/callback/callback.component";

// Resolvers
import { ChartResolver } from "./routes/chart/chart-resolver.service";
import {
	isAuthenticatedGuard,
	redirectIfAuthenticatedGuard,
} from "./auth/auth.guard";
import { PageErrorComponent } from "./routes/error/error.component";
import { LinkComponent } from "./routes/link/link.component";
import { PrivacyPolicyComponent } from "./routes/privacy-policy/privacy-policy.component";
import { TermsOfServiceComponent } from "./routes/terms-of-service/terms-of-service.component";

export const routes: Routes = [
	{
		path: "login",
		component: LoginComponent,
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Login",
	},
	{
		path: "callback",
		component: OAuthCallbackComponent,
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Authenticating...",
	},
	{
		path: "overview",
		component: OverviewComponent,
		canActivate: [isAuthenticatedGuard],
		title: "Overview",
	},
	{
		path: "published",
		component: PublishedComponent,
		canActivate: [isAuthenticatedGuard],
		title: "Published",
	},
	{
		path: "chart/:id",
		component: ChartComponent,
		resolve: { chart: ChartResolver },
		canActivate: [isAuthenticatedGuard],
		runGuardsAndResolvers: "always",
	},
	{
		path: "privacy-policy",
		component: PrivacyPolicyComponent,
		title: "Our Privacy Policy: Transparency for Our Community",
	},
	{
		path: "terms-of-service",
		component: TermsOfServiceComponent,
		title: "Our Terms of Service",
	},
	{
		path: "link/:type/:id",
		component: LinkComponent,
	},
	{
		path: "error",
		component: PageErrorComponent,
		title: "Error",
	},
	{ path: "", redirectTo: "/published", pathMatch: "full" }, // Redirect to published
	{ path: "**", title: "Oops. 404", component: PageNotFoundComponent }, // Should be the last
];
