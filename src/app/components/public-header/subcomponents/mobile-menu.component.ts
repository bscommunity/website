import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MobileMenuItemComponent } from "./menu-item.component";

@Component({
	selector: "app-mobile-menu",
	imports: [MobileMenuItemComponent],
	templateUrl: "./mobile-menu.component.html",
})
export class MobileMenuComponent {
	@Input() isOpen!: boolean;
	@Output() closeMenu = new EventEmitter<void>();

	onClose() {
		this.closeMenu.emit();
	}
}
