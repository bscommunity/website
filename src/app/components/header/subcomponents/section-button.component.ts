import { NgIf } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
	selector: "app-section-button",
	template: `
		<button
			*ngIf="isActive; else outlinedButton"
			mat-flat-button
			(click)="handleClick()"
		>
			<ng-content></ng-content>
		</button>
		<ng-template #outlinedButton>
			<button mat-stroked-button (click)="handleClick()">
				<ng-content></ng-content>
			</button>
		</ng-template>
	`,
	imports: [NgIf],
})
export class SectionButtonComponent {
	@Input() isActive = false;
	@Output() buttonClick = new EventEmitter<void>();

	handleClick() {
		this.buttonClick.emit();
	}
}
