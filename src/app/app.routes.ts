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
import { TestComponent } from "./routes/test.component";

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
	},
	{
		path: "test",
		component: TestComponent,
	},
	{ path: "", redirectTo: "/published", pathMatch: "full" }, // Redirect to published
	{ path: "**", title: "Oops. 404", component: PageNotFoundComponent }, // Should be the last
];
