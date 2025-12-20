import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatTabsModule } from "@angular/material/tabs";

// Components
import { TabContentWrapperComponent } from "@/components/tab-content-wrapper/tab-content-wrapper.component";

@Component({
	selector: "app-profile",
	imports: [
		MatIconModule,
		MatButtonModule,
		MatRippleModule,
		MatTabsModule,
		RouterLink,
		TabContentWrapperComponent,
	],
	templateUrl: "./profile.html",
})
export class Profile implements OnInit {
	route: ActivatedRoute = inject(ActivatedRoute);

	username: string = this.route.snapshot.params["username"];

	tabs = [
		{ label: "Charts", value: "charts" },
		{ label: "About", value: "about" },
	];
	currentTab = this.tabs[0].value;

	ngOnInit(): void {
		const section = this.route.snapshot.queryParamMap.get("section");
		this.currentTab =
			this.tabs.find((tab) => tab.value === section)?.value ||
			this.tabs[0].value;
	}
}
