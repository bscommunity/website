import { Component, EventEmitter, Input, Output } from "@angular/core";

// Components
import { MobileMenuItemComponent } from "./menu-item.component";
import { ThemePickerComponent } from "@/components/theme-picker/theme-picker.component";
import { StatusDisplayComponent } from "@/components/status-display/status-display.component";

@Component({
	selector: "app-mobile-menu",
	imports: [
		MobileMenuItemComponent,
		ThemePickerComponent,
		StatusDisplayComponent,
	],
	templateUrl: "./mobile-menu.component.html",
})
export class MobileMenuComponent {
	@Input() isOpen!: boolean;
	@Output() closeMenu = new EventEmitter<void>();

	onClose() {
		this.closeMenu.emit();
	}
}
