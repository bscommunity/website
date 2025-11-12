import { CommonModule } from "@angular/common";
import { Component, computed, input, signal } from "@angular/core";
import { twMerge } from "tailwind-merge";

@Component({
	selector: "app-avatar",
	imports: [CommonModule],
	templateUrl: "./avatar.component.html",
})
export class AvatarComponent {
	readonly src = input<string | null | undefined>(null);
	readonly alt = input<string | null | undefined>("User profile picture");
	readonly class = input<string>("");

	imageLoaded = signal(false);

	readonly imageClasses = computed(() =>
		twMerge(
			"rounded-full aspect-square object-cover w-10 h-10 z-20 relative",
			this.class(),
		),
	);

	readonly fallbackClasses = computed(() =>
		twMerge(
			"rounded-full flex items-center justify-center z-0 bg-primary-container w-10 h-10 absolute top-0 left-0",
			this.class(),
		),
	);

	onLoad() {
		this.imageLoaded.set(true);
	}

	onError() {
		this.imageLoaded.set(false);
	}
}
