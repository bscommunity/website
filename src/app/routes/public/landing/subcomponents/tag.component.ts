import { Component, input } from "@angular/core";

import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: "app-landing-tag",
    imports: [MatIconModule],
    template: `
        <a [href]="href()" class="flex flex-row items-center rounded-full py-1 pl-1 pr-4 bg-surface-container-low border border-outline-variant gap-3 text-sm hover:bg-surface-container group">
            <div class="bg-primary-container px-3 py-1.5 rounded-full">
                <span class="font-normal">{{ label() }}</span>
            </div>
            <p class="flex md:hidden">{{ mobileText() }}</p>
            <p class="hidden md:flex">{{ text() }}</p>
            <mat-icon class="transition-transform duration-300 group-hover:translate-x-0.5">keyboard_double_arrow_right</mat-icon>
        </a>
    `
})
export class LandingTagComponent {
    label = input<string>();
    mobileText = input<string>();
    text = input<string>("");
    href = input<string>("#");
}
