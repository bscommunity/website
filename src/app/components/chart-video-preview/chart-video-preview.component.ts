import {
	ChangeDetectionStrategy,
	Component,
	input,
	inject,
	computed,
	signal,
	ViewChild,
	ElementRef,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
	selector: "app-chart-video-preview",
	templateUrl: "./chart-video-preview.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
})
export class ChartVideoPreviewComponent {
	private sanitizer = inject(DomSanitizer);
	previewUrl = input.required<string | null>();
	audioPreviewUrl = input.required<string | null>();

	@ViewChild("audioElement") audioElement?: ElementRef<HTMLAudioElement>;

	isPlaying = signal(false);
	progress = signal(0);
	duration = signal(0);

	maxAudioDuration = 15;

	embedUrl = computed(() => {
		const url = this.previewUrl();
		if (!url) return null;

		try {
			/* const parsedUrl = new URL(url);
			const videoId = parsedUrl.searchParams.get("v");
			if (!videoId) return null; */

			const embedUrl = `https://www.youtube.com/embed/${url}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&playlist=${url}`;
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

	toggleAudio() {
		const audio = this.audioElement?.nativeElement;
		if (!audio) return;

		if (this.isPlaying()) {
			audio.pause();
			this.isPlaying.set(false);
		} else {
			audio.play();
			this.isPlaying.set(true);
		}
	}

	onTimeUpdate(event: Event) {
		const audio = event.target as HTMLAudioElement;
		if (audio.duration) {
			const progressValue =
				(audio.currentTime /
					Math.min(audio.duration, this.maxAudioDuration)) *
				100;
			this.progress.set(progressValue);

			// Limite de duração
			if (audio.currentTime >= this.maxAudioDuration) {
				audio.pause();
				audio.currentTime = 0;
				this.isPlaying.set(false);
				this.progress.set(0);
			}
		}
	}

	onLoadedMetadata(event: Event) {
		const audio = event.target as HTMLAudioElement;
		this.duration.set(audio.duration);
	}

	onEnded() {
		this.isPlaying.set(false);
		this.progress.set(0);
	}
}
