import { Component, inject, input, model, OnInit } from "@angular/core";

// Material
import { MatIconModule } from "@angular/material/icon";
import { MatTabNavPanel, MatTabsModule } from "@angular/material/tabs";
import { ActivatedRoute, RouterLink } from "@angular/router";

export interface Tab {
	label: string;
	value: string;
	icon?: string;
	showLabel?: boolean;
	disabled?: boolean;
}

@Component({
	selector: "app-tab-nav-bar",
	imports: [MatTabsModule, MatIconModule, RouterLink],
	template: `
		<nav mat-tab-nav-bar [tabPanel]="tabPanel()" class="w-full">
			@for (tab of tabs(); track tab.value) {
				<a
					class="transition-opacity duration-200"
					mat-tab-link
					[ariaLabel]="tab.label"
					[attr.aria-current]="
						currentTab() === tab.value ? 'page' : null
					"
					[active]="currentTab() === tab.value"
					[routerLink]="urlBased() ? [] : null"
					[queryParams]="urlBased() ? { section: tab.value } : null"
					(click)="setCurrentTab(tab.value)"
					[class.opacity-100]="currentTab() === tab.value"
					[class.opacity-50]="
						currentTab() !== tab.value || tab.disabled
					"
					[class.pointer-events-none]="tab.disabled"
					[class.cursor-not-allowed]="tab.disabled"
				>
					@if (tab.icon) {
						<mat-icon class="align-middle">
							{{ tab.icon }}
						</mat-icon>
					}
					@if (tab.label && tab.showLabel) {
						<span class="ml-4">{{ tab.label }}</span>
					}
				</a>
			}
		</nav>
	`,
})
export class TabNavBarComponent implements OnInit {
	private route = inject(ActivatedRoute);

	tabPanel = input<MatTabNavPanel | undefined>();
	urlBased = input<boolean | string>(false);

	tabs = input<Tab[]>();

	currentTab = model<string>("");

	setCurrentTab(value: string) {
		this.currentTab.set(value);
	}

	ngOnInit(): void {
		if (this.urlBased()) {
			const section = this.route.snapshot.queryParamMap.get("section");
			this.currentTab.set(
				this.tabs()?.find((tab) => tab.value === section)?.value ||
					this.tabs()![0].value,
			);
		}
	}
}
