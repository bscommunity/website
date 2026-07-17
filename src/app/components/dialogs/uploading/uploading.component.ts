import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	DestroyRef,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import type { Observable } from "rxjs";
import { interval, map } from "rxjs";
import type { PublishEvent } from "@/services/publish/publish-event.service";

const MOCK_MESSAGES: { icon: string; message: string }[] = [
	{ icon: "image", message: "Uploading cover image" },
	{ icon: "check_circle", message: "Validating chart data" },
	{ icon: "account_tree", message: "Processing dependencies" },
	{ icon: "photo_library", message: "Generating thumbnails" },
	{ icon: "publish", message: "Publishing to registry" },
	{ icon: "upload", message: "Finalizing upload" },
];

const STEP_ICONS: Record<string, string> = {
	upload: "upload",
	validate: "check_circle",
	process: "account_tree",
	thumbnail: "photo_library",
	publish: "publish",
	completed: "check",
	error: "error",
};

@Component({
	selector: "app-publish-dialog-uploading",
	templateUrl: "./uploading.component.html",
	imports: [MatDialogModule, MatIconModule, MatProgressSpinnerModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishDialogUploadingComponent {
	currentMessage = signal("Preparing your chart...");
	currentIcon = signal("hourglass_top");
	showMessage = signal(true);

	private destroyRef = inject(DestroyRef);
	private cdr = inject(ChangeDetectorRef);

	constructor() {
		const data = inject<{ progress$?: Observable<PublishEvent> } | null>(
			MAT_DIALOG_DATA,
		);

		const progress$ =
			data?.progress$ ??
			interval(2000).pipe(
				map((i) => ({
					step: "progress",
					message: MOCK_MESSAGES[i % MOCK_MESSAGES.length].message,
					icon: MOCK_MESSAGES[i % MOCK_MESSAGES.length].icon,
				})),
			);

		progress$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (event) => {
				this.showMessage.set(false);
				setTimeout(() => {
					this.currentMessage.set(event.message);
					this.currentIcon.set(
						"icon" in event
							? (event as { icon: string }).icon
							: (STEP_ICONS[event.step] ?? "hourglass_top"),
					);
					this.showMessage.set(true);
					this.cdr.markForCheck();
				}, 200);
			},
			error: () => {
				this.showMessage.set(false);
				setTimeout(() => {
					this.currentMessage.set(
						"Something went wrong. Please try again.",
					);
					this.currentIcon.set("error");
					this.showMessage.set(true);
					this.cdr.markForCheck();
				}, 200);
			},
		});
	}
}
