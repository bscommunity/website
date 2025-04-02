import { bootstrapApplication } from "@angular/platform-browser";
import { enableProdMode } from "@angular/core";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";
import { environment } from "environments/environment";

if (environment.PRODUCTION !== "false") {
	// If the environment is production, enable production mode
	enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
	console.error(err),
);
