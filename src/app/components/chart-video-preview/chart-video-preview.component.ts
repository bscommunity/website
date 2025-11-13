import {
	ChangeDetectionStrategy,
	Component,
	input,
	inject,
	computed,
} from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
	selector: "app-chart-video-preview",
	template: `
		<div
			class="flex flex-row items-center justify-center gap-2 h-42 md:h-48"
			(click)="openVideo()"
		>
			<img
				[src]="coverUrl()"
				alt="Chart Cover"
				class="h-full object-contain rounded-[28px] shadow-md"
			/>
			@if (embedUrl()) {
				<iframe
					[src]="embedUrl()"
					[style.pointer-events]="'none'"
					class="h-full w-full object-contain rounded-[28px] cursor-pointer"
					allowfullscreen
				></iframe>
			} @else {
				<div
					class="flex items-center justify-center h-full w-full rounded-[28px] bg-on-surface/10"
				>
					<p class="text-center text-sm px-3">
						No preview available.
					</p>
				</div>
			}
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
})
export class ChartVideoPreviewComponent {
	private sanitizer = inject(DomSanitizer);

	coverUrl = input.required<string>();
	previewUrl = input.required<string | null>();

	embedUrl = computed(() => {
		const url = this.previewUrl();
		if (!url) return null;

		try {
			const parsedUrl = new URL(url);
			const videoId = parsedUrl.searchParams.get("v");
			if (!videoId) return null;

			const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&playlist=${videoId}`;
			return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
		} catch {
			return null;
		}
	});

	openVideo() {
		const url = this.previewUrl();
		if (url) {
			window.open(url, "_blank");
		}
	}
}
