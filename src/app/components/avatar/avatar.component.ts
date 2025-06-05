import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";

@Component({
	selector: "app-avatar",
	imports: [CommonModule],
	templateUrl: "./avatar.component.html",
})
export class AvatarComponent {
	readonly src = input<string | null | undefined>(null);
	readonly alt = input<string | null | undefined>("User profile picture");
	readonly size = input<number | null | undefined>(40);
}
