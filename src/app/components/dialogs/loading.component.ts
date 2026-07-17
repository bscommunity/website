import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

// Material
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import type { Observable } from "rxjs";
import type { PublishEvent } from "@/services/publish/publish-event.service";

@Component({
	selector: "app-publish-dialog-loading",
	template: `
		<h2 mat-dialog-title>Submitting...</h2>
		<mat-dialog-content
			class="mat-typography !flex items-center justify-center flex-col gap-4"
		>
			<p>
				{{ currentMessage() }} <br />
				Do not close this window.
			</p>
			<mat-progress-spinner
				class="!my-6"
				mode="indeterminate"
				diameter="48"
			/>
		</mat-dialog-content>
	`,
	imports: [MatDialogModule, MatProgressSpinnerModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishDialogLoadingComponent {
	currentMessage = signal("Preparing your chart...");

	private destroyRef = inject(DestroyRef);

	constructor() {
		const data = inject<{ progress$: Observable<PublishEvent> }>(MAT_DIALOG_DATA);

		data.progress$
			?.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (event) => this.currentMessage.set(event.message),
				error: () =>
					this.currentMessage.set(
						"Something went wrong. Please try again.",
					),
			});
	}
}
