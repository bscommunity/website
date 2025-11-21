import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
} from "@angular/core";
import { Router } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

interface Button {
	label: string;
	link: string;
	icon?: string;
}

@Component({
	selector: "app-large-panel",
	template: `
		<div
			class="flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-container-low rounded-2xl px-9 py-6 md:py-4 w-full"
		>
			<div
				class="flex flex-row items-start md:items-center justify-start gap-6"
			>
				<mat-icon class="min-w-6"> help </mat-icon>
				<div class="flex flex-col items-start justify-start">
					<b
						><p>{{ title() }}</p></b
					>
					<p>
						{{ message() }}
					</p>
				</div>
			</div>
			<button
				class="min-w-fit! max-md:w-full"
				mat-flat-button
				(click)="onClick()"
			>
				<mat-icon
					class="max-w-5!"
					svgIcon="discord"
					inline="true"
					aria-hidden="false"
					aria-label="Discord logo"
				></mat-icon>
				{{ button().label }}
			</button>
		</div>
	`,
	imports: [MatIconModule, MatButtonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LargePanelComponent {
	readonly title = input<string>("");
	readonly message = input<string>("");
	readonly button = input<Button>({
		label: "",
		link: "",
		icon: "",
	});

	private router = inject(Router);

	onClick() {
		const link = this.button().link;
		if (link) {
			if (link.startsWith("http://") || link.startsWith("https://")) {
				// External link
				window.open(link, "_blank");
			} else {
				// Internal navigation
				this.router.navigate([link]);
			}
		}
	}
}
