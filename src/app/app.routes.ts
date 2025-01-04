import type { Routes } from "@angular/router";

// Routes
import { PageNotFoundComponent } from "./routes/page-not-found/page-not-found.component";
import { PublishedComponent } from "./routes/published/published.component";
import { OverviewComponent } from "./routes/overview/overview.component";
import { ChartComponent } from "./routes/chart/chart.component";

export const routes: Routes = [
	{ path: "overview", component: OverviewComponent, title: "Overview" },
	{ path: "published", component: PublishedComponent, title: "Published" },
	{ path: "chart", component: ChartComponent, title: "Chart" },
	{ path: "", redirectTo: "/published", pathMatch: "full" },
	// The 404 page should be the last
	{ path: "**", title: "Oops. 404", component: PageNotFoundComponent },
];
