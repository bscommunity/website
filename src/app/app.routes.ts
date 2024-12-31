import type { Routes } from "@angular/router";

// Routes
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { PublishedComponent } from "./published/published.component";

export const routes: Routes = [
	{ path: "published", component: PublishedComponent, title: "Published" },
	{ path: "", redirectTo: "/published", pathMatch: "full" },
	// The 404 page should be the last
	{ path: "**", title: "Oops. 404", component: PageNotFoundComponent },
];
