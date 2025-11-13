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
	templateUrl: "./chart-video-preview.component.html",
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
