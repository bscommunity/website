import { Component, Input, Output, EventEmitter } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-mobile-menu-item",
	imports: [RouterLink],
	template: `<a
		[routerLink]="link"
		class="block py-2 text-on-surface hover:text-primary"
		(click)="closeMenu.emit()"
		>{{ text }}</a
	>`,
})
export class MobileMenuItemComponent {
	@Input() link!: string;
	@Input() text!: string;
	@Output() closeMenu = new EventEmitter<void>();
}
