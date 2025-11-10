import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-settings-card",
	imports: [CommonModule],
	template: `
		<div
			[ngClass]="{
				'border-surface-container-high': variant() === 'default',
				'border-error-container': variant() === 'destructive',
				'opacity-50 **:pointer-events-none': disabled(),
			}"
			class="flex flex-col items-start justify-start border rounded-lg overflow-hidden"
		>
			<div
				[ngClass]="{
					'bg-surface-container-low': variant() === 'default',
					'bg-transparent': variant() === 'destructive',
				}"
				class="flex flex-col items-start justify-start gap-2 p-6 w-full"
			>
				<h3
					[ngClass]="{
						'text-on-error-container': variant() === 'destructive',
						'text-on-surface-variant': variant() === 'default',
					}"
					class="font-semibold text-xl"
				>
					{{ title() }}
				</h3>
				<p class="text-base text-on-surface">{{ description() }}</p>
				<ng-content select="card-content"></ng-content>
			</div>
			@if (showFooter()) {
				<div
					[ngClass]="{
						'bg-[#93000a3c]': variant() === 'destructive',
					}"
					class="flex flex-row items-center justify-between gap-4 px-6 py-4 w-full"
				>
					<p class="text-base text-on-surface-variant">
						<ng-content select="card-footer-label"></ng-content>
					</p>
					<ng-content select="card-footer"></ng-content>
				</div>
			}
		</div>
	`,
})
export class SettingsCardComponent {
	title = input.required<string>();
	description = input.required<string>();
	variant = input<"default" | "destructive">("default");
	showFooter = input<boolean>(true);
	disabled = input<boolean>(false);
}
