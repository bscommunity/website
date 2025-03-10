import { Component, Input } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { ReleaseNote } from "./release-template.component";

@Component({
	selector: "app-release-template-item",
	imports: [MatIcon],
	template: `
		<div
			class="flex flex-col justify-center items-start gap-4 overflow-hidden"
		>
			<div
				class="inline-flex justify-start items-center gap-3 overflow-hidden"
			>
				<span
					class="flex self-center text-inherit leading-none select-none text-lg"
				>
					<mat-icon inline>
						{{
							features !== null
								? "local_fire_department"
								: "bug_report"
						}}
					</mat-icon>
				</span>
				<div
					class="relative justify-center text-base font-medium leading-snug"
				>
					{{ features !== null ? "Features" : "Fixes" }}
				</div>
			</div>
			<ul
				class="flex flex-col justify-start items-start gap-3 md:gap-1 overflow-hidden list-disc list-inside text-on-background text-base font-normal leading-snug"
			>
				@if (features !== null) {
					@for (item of features; track $index) {
						<li class="flex-1 relative justify-center">
							{{ item }}
						</li>
					}
				} @else {
					@for (item of fixes; track $index) {
						<li class="flex-1 relative justify-center">
							{{ item.description }}
						</li>
					}
				}
			</ul>
		</div>
	`,
})
export class ReleaseTemplateItemComponent {
	@Input() features: ReleaseNote["features"] | null = null;
	@Input() fixes: ReleaseNote["fixes"] | null = null;
}
