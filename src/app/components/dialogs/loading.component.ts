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

import type { Observable } from "rxjs";
import type { PublishEvent } from "@/services/publish/publish-event.service";

@Component({
	selector: "app-publish-dialog-loading",
	template: `
		<div
			class="w-[380px] rounded-2xl px-7 pt-8 pb-8 border border-[var(--mat-sys-outline-variant)] bg-[var(--mat-sys-surface-container-high)]"
		>
			<h1 class="text-xl font-medium m-0 mb-2">Submitting</h1>
			<p
				class="text-sm text-[var(--mat-sys-on-surface-variant)] m-0 mb-7"
			>
				This usually takes a few seconds.
			</p>

			<div class="flex justify-center mb-7">
				<svg
					width="56"
					height="56"
					viewBox="0 0 56 56"
					class="animate-spin-loading"
				>
					<circle
						cx="28"
						cy="28"
						r="22"
						fill="none"
						stroke="var(--mat-sys-outline-variant)"
						stroke-width="4"
					></circle>
					<circle
						cx="28"
						cy="28"
						r="22"
						fill="none"
						stroke="var(--mat-sys-primary)"
						stroke-width="4"
						stroke-linecap="round"
						stroke-dasharray="34 104"
					></circle>
				</svg>
			</div>

			@if (showMessage()) {
				<div
					class="rounded-xl bg-[var(--mat-sys-surface-container)] px-3.5 py-3 flex items-center gap-2.5 overflow-hidden animate-slide-fade"
				>
					<i
						class="ti ti-photo text-lg text-[var(--mat-sys-on-surface-variant)]"
						aria-hidden="true"
					></i>
					<span class="text-sm flex-1">{{ currentMessage() }}</span>
					<span class="flex gap-[3px]">
						<span class="dot" style="animation-delay: 0s;"></span>
						<span class="dot" style="animation-delay: 0.15s;"></span>
						<span class="dot" style="animation-delay: 0.3s;"></span>
					</span>
				</div>
			}
		</div>
	`,
	imports: [MatDialogModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishDialogLoadingComponent {
	currentMessage = signal("Preparing your chart...");
	showMessage = signal(true);

	private destroyRef = inject(DestroyRef);
	private cdr = inject(ChangeDetectorRef);

	constructor() {
		const data = inject<{ progress$: Observable<PublishEvent> }>(
			MAT_DIALOG_DATA,
		);

		data.progress$
			?.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (event) => {
					this.showMessage.set(false);
					setTimeout(() => {
						this.currentMessage.set(event.message);
						this.showMessage.set(true);
						this.cdr.markForCheck();
					}, 100);
				},
				error: () => {
					this.showMessage.set(false);
					setTimeout(() => {
						this.currentMessage.set(
							"Something went wrong. Please try again.",
						);
						this.showMessage.set(true);
						this.cdr.markForCheck();
					}, 100);
				},
			});
	}
}
