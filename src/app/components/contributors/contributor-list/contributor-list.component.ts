import {
	ChangeDetectionStrategy,
	Component,
	input,
	output,
	booleanAttribute,
} from "@angular/core";

import { NgGlyph } from "@ng-icons/core";

import { ContributorItemComponent } from "../contributor-item/contributor-item.component";

import { SimplifiedUserModel } from "@/models/user.model";
import { ContributorRole } from "@/models/enums/role.enum";
import { WritableSignal } from "@angular/core";

@Component({
	selector: "app-contributor-list",
	template: `
		@if (users().length > 0) {
			<ul class="flex flex-col items-center justify-start w-full gap-4">
				@for (user of users(); track user.id) {
					<app-contributor-item
						class="w-full"
						[user]="user"
						[roles]="roles()"
						[availableRoles]="availableRoles()"
						[canRemove]="canRemove()"
						(remove)="userRemoved.emit($event)"
					/>
				}
			</ul>
		} @else {
			<div class="flex flex-col items-center justify-center gap-4 pt-4">
				<ng-glyph name="conditions" size="48" />
				<p class="text-center w-full px-6">
					{{ emptyMessage() }}
				</p>
			</div>
		}
	`,
	imports: [NgGlyph, ContributorItemComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributorListComponent {
	readonly users = input.required<SimplifiedUserModel[]>();
	readonly roles =
		input.required<WritableSignal<Map<string, ContributorRole[]>>>();
	readonly availableRoles = input.required<ContributorRole[]>();
	readonly canRemove = input(false, { transform: booleanAttribute });
	readonly emptyMessage = input(
		"No contributors added. Start adding members for them to appear here!",
	);
	readonly userRemoved = output<string>();
}
