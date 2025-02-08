import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
	selector: "app-avatar",
	imports: [CommonModule],
	templateUrl: "./avatar.component.html",
})
export class AvatarComponent {
	@Input() src: string | null | undefined = null;
	@Input() alt: string | null | undefined = "User profile picture";
	@Input() size: number | null | undefined = 40;
}
