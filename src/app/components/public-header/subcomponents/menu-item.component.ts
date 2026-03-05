import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core";
import { MatRippleModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import {
	RouterLink,
	RouterLinkActive,
	IsActiveMatchOptions,
} from "@angular/router";

@Component({
	selector: "app-mobile-menu-item",
	imports: [RouterLink, MatIconModule, MatRippleModule, RouterLinkActive],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		@if (variant === "simple") {
			<div
				class="flex items-center justify-between py-2 text-on-surface w-full"
			>
				<span class="flex items-center justify-start gap-4">
					@if (svgIcon) {
						<mat-icon [svgIcon]="svgIcon"></mat-icon>
					} @else if (icon) {
						<mat-icon>{{ icon }}</mat-icon>
					}
					{{ text }}
				</span>
				<ng-content></ng-content>
			</div>
		} @else if (variant === "link") {
			<a
				[href]="link"
				target="_blank"
				class="flex items-center justify-start gap-4 py-2 text-on-surface hover:text-primary"
			>
				@if (svgIcon) {
					<mat-icon [svgIcon]="svgIcon"></mat-icon>
				} @else if (icon) {
					<mat-icon>{{ icon }}</mat-icon>
				}
				{{ text }}
			</a>
		} @else {
			<a
				matRipple
				[routerLink]="link"
				routerLinkActive="bg-surface-container text-primary"
				[routerLinkActiveOptions]="routerLinkActiveOptions || { exact: false }"
				class="flex items-center justify-start gap-4 px-4 py-3 text-on-surface hover:text-primary hover:bg-surface-container rounded-md transition-colors w-full"
				(click)="closeMenu.emit()"
			>
				@if (svgIcon) {
					<mat-icon [svgIcon]="svgIcon"></mat-icon>
				} @else if (icon) {
					<mat-icon>{{ icon }}</mat-icon>
				}
				{{ text }}
			</a>
		}
	`,
})
export class MobileMenuItemComponent {
	@Input() link!: string;
	@Input() text!: string;
	@Input() icon: string | undefined;
	@Input() svgIcon: string | undefined;
	@Input() variant: "simple" | "detailed" | "link" = "detailed";
	@Input() routerLinkActiveOptions?:
		| IsActiveMatchOptions
		| { exact: boolean };
	@Output() closeMenu = new EventEmitter<void>();
}
