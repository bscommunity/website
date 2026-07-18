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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NgGlyph } from "@ng-icons/core";
import type { Observable } from "rxjs";
import { interval, map } from "rxjs";
import type { PublishEvent } from "@/services/publish/publish-event.service";

const MOCK_MESSAGES: { step: string; message: string }[] = [
	{ step: "extracting_bundle", message: "Extracting bundle data" },
	{ step: "parsing_chart", message: "Parsing chart" },
	{ step: "fetching_media_info", message: "Fetching media information" },
	{ step: "creating_chart", message: "Creating chart in database" },
	{ step: "preparing_bundle", message: "Preparing bundle" },
	{ step: "uploading_to_discord", message: "Uploading to Discord" },
	{ step: "finalizing_version", message: "Finalizing version" },
	{ step: "uploading_cover", message: "Uploading cover image" },
	{ step: "generating_preview", message: "Generating audio preview" },
	{ step: "logging_activity", message: "Saving activity" },
	{ step: "completed", message: "Done!" },
];

const STEP_ICONS: Record<string, string> = {
	extracting_bundle: "unarchive",
	parsing_chart: "analytics",
	resolving_metadata: "label",
	fetching_media_info: "music_note",
	creating_chart: "add_chart",
	preparing_bundle: "folder_special",
	uploading_to_discord: "cloud_upload",
	finalizing_version: "task_alt",
	uploading_cover: "image",
	generating_preview: "equalizer",
	logging_activity: "receipt_long",
	completed: "check_circle",
	error: "error",
};

@Component({
	selector: "app-publish-dialog-uploading",
	templateUrl: "./uploading.component.html",
	imports: [MatDialogModule, NgGlyph, MatProgressSpinnerModule],
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
					step: MOCK_MESSAGES[i % MOCK_MESSAGES.length].step,
					message: MOCK_MESSAGES[i % MOCK_MESSAGES.length].message,
				})),
			);

		progress$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (event) => {
				this.showMessage.set(false);
				setTimeout(() => {
					this.currentMessage.set(event.message);
					this.currentIcon.set(
						STEP_ICONS[event.step] ?? "hourglass_top",
					);
					this.showMessage.set(true);
					this.cdr.markForCheck();
				}, 400);
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
				}, 400);
			},
		});
	}
}
