import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

interface Button {
	label: string;
	link: string;
	icon?: string;
}

@Component({
	selector: "app-panel",
	template: `
		<div
			class="flex flex-row items-center justify-start gap-4 rounded-lg px-6 py-4 w-full"
			[ngClass]="{
				'bg-info/50': variant() === 'info',
			}"
		>
			<mat-icon class="icon-20"> help </mat-icon>
			<p class="text-sm">
				<ng-content></ng-content>
			</p>
		</div>
	`,
	imports: [MatIconModule, MatButtonModule, CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
	readonly variant = input<"info">("info");
}
