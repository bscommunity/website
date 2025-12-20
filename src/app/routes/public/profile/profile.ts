import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTabsModule } from "@angular/material/tabs";

// Components
import { TabContentWrapperComponent } from "@/components/tabs/tab-content-wrapper.component";
import { BadgeComponent } from "@/components/badge/badge.component";
import {
	type Tab,
	TabNavBarComponent,
} from "@/components/tabs/tab-nav-bar.component";

@Component({
	selector: "app-profile",
	imports: [
		MatIconModule,
		MatButtonModule,
		MatRippleModule,
		MatTabsModule,
		RouterLink,
		TabContentWrapperComponent,
		BadgeComponent,
		TabNavBarComponent,
	],
	templateUrl: "./profile.html",
})
export class Profile {
	route: ActivatedRoute = inject(ActivatedRoute);

	username: string = this.route.snapshot.params["username"];

	tabs: Tab[] = [
		{
			label: "History",
			showLabel: false,
			value: "history",
			icon: "bar_chart",
		},
		{
			label: "Charts",
			showLabel: false,
			value: "charts",
			icon: "library_music",
		},
	];
	currentTab = this.tabs[0].value;
}
