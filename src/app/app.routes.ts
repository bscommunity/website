import type { Routes } from "@angular/router";

// Routes
import { PageNotFoundComponent } from "./routes/not-found/not-found.component";
import { PublishedComponent } from "./routes/published/published.component";
import { OverviewComponent } from "./routes/overview/overview.component";
import { ChartComponent } from "./routes/chart/chart.component";

// Resolvers
import { ChartResolver } from "./routes/chart/chart-resolver.service";
import { LoginComponent } from "./routes/login/login.component";
import {
	isAuthenticatedGuard,
	redirectIfAuthenticatedGuard,
} from "./auth/auth.guard";

export const routes: Routes = [
	{
		path: "login",
		component: LoginComponent,
		canActivate: [redirectIfAuthenticatedGuard],
		title: "Login",
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
	{ path: "", redirectTo: "/published", pathMatch: "full" }, // Redirect to published
	{ path: "**", title: "Oops. 404", component: PageNotFoundComponent }, // Should be the last
];
