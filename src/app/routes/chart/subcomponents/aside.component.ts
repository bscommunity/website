import { Component, Input } from "@angular/core";
import { AsideSectionComponent } from "./aside-section.component";
import { AsideContainerComponent } from "./aside-container.component";
import { transformDuration } from "@/lib/time";

@Component({
	selector: "app-aside",
	template: `
		<aside class="flex flex-col items-start justify-start gap-6 w-full">
			<div class="absolute top-0 left-0 md:relative w-full max-md:-z-10">
				<img
					class="w-full opacity-50 md:opacity-100 md:w-72 aspect-square md:rounded-lg"
					[src]="coverUrl"
					[alt]="trackName"
				/>
				<div
					class="flex md:hidden absolute bottom-0 left-0 h-24 w-full bg-gradient-to-b from-transparent to-background"
				></div>
			</div>
			<app-aside-section title="Chart Info" class="w-full">
				<app-aside-container
					class="w-full"
					icon="timer"
					[info]="duration"
				></app-aside-container>
				<app-aside-container
					class="w-full"
					icon="music_note"
					[info]="notesAmount + ' notes'"
				></app-aside-container>
			</app-aside-section>
			<app-aside-section title="Files" class="w-full">
				<a
					class="w-full cursor-pointer"
					[href]="chartUrl"
					target="_blank"
					download
				>
					<app-aside-container
						class="w-full"
						asideContainerClass="hover:bg-surface-container-low"
						info="Download .zip"
					></app-aside-container>
				</a>
			</app-aside-section>
		</aside>
	`,
	imports: [AsideSectionComponent, AsideContainerComponent],
})
export class AsideComponent {
	@Input() trackName: string = "";
	@Input() coverUrl: string = "";
	@Input() chartUrl: string = "";
	@Input({
		transform: transformDuration,
	})
	duration: string = "";
	@Input() notesAmount: number = 0;
}
