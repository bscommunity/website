import { Component, input, signal, OnInit } from "@angular/core";
import { NgGlyph } from "@ng-icons/core";

@Component({
	selector: "app-landing-tag",
	imports: [NgGlyph],
	template: `
		<a
			[href]="href()"
			class="flex flex-row items-stretch rounded-full py-1 px-1 bg-surface-container-low outline outline-outline-variant gap-3 text-sm hover:bg-surface-container group transition-all duration-700 ease-in-out overflow-hidden max-h-14 md:h-11 text-on-surface"
			[class.max-w-12]="!label()"
			[class.max-w-full]="!!label()"
		>
			<div
				class="bg-primary-container px-3 py-1.5 rounded-full flex items-center justify-center self-stretch min-w-fit"
			>
				<span class="font-normal text-center">{{
					label() || "..."
				}}</span>
			</div>

			@if (label()) {
				<p
					class="hidden self-center text-center md:flex"
					[class.fade-in]="!hasInitialLabel()"
					[class.opacity-0]="!hasInitialLabel()"
				>
					{{ text() }}
				</p>

				<p
					class="flex self-center text-center md:hidden! line-clamp-2! text-ellipsis"
					[class.fade-in]="!hasInitialLabel()"
					[class.opacity-0]="!hasInitialLabel()"
				>
					{{ mobileText() }}
				</p>

				<ng-glyph
					name="keyboard_double_arrow_right"
					class="self-center transition-transform duration-300 group-hover:translate-x-0.5 mr-3!"
				/>
			}
		</a>
	`,
})
export class LandingTagComponent implements OnInit {
	class = input<string>("");
	label = input<string | undefined>(undefined);
	mobileText = input<string | undefined>(undefined);
	text = input<string | undefined>(undefined);
	href = input<string>("#");

	hasInitialLabel = signal(false);

	ngOnInit() {
		// If there was already a label on the first render, avoid the fade-in
		if (this.label()) {
			this.hasInitialLabel.set(true);
		}
	}
}
